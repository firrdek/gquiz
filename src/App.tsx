import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { Circle as CircleGeom } from 'ol/geom';
import { fromCircle } from 'ol/geom/Polygon';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';
import { createEmpty, extend } from 'ol/extent';
import { fromLonLat, toLonLat } from 'ol/proj';
import {
  type AnswerData,
  type SharedResult,
  buildShareLink,
  calculateScore,
  distanceKm,
  getDailyCities,
  getDateKey,
  gradeFor,
  parseShareHash,
  totalScore,
} from './game';
import {
  overlayStyle,
  cardStyle,
  topOverlayStyle,
  topCardStyle,
  primaryBtn,
  ghostBtn,
  thStyle,
  tdStyle,
  theme,
  totalRowStyle,
  gradeStyle,
  shareUrlStyle,
} from './theme';

type Phase = 'menu' | 'playing' | 'results' | 'shared';

/* ------------------------------ Map styles ------------------------------ */

const guessMarkerStyle: Style[] = [
  new Style({
    image: new CircleStyle({ radius: 14, fill: new Fill({ color: 'rgba(59,130,246,0.3)' }) }),
  }),
  new Style({
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({ color: '#3b82f6' }),
      stroke: new Stroke({ color: '#ffffff', width: 2 }),
    }),
  }),
];

const lineStyle = new Style({
  stroke: new Stroke({ color: 'rgba(37,99,235,0.85)', width: 2, lineDash: [8, 8] }),
});

const distanceCircleStyle = new Style({
  stroke: new Stroke({ color: 'rgba(34,197,94,0.8)', width: 2 }),
  fill: new Fill({ color: 'rgba(34,197,94,0.12)' }),
});

function answerMarkerStyle(label: string): Style[] {
  return [
    new Style({
      image: new CircleStyle({ radius: 14, fill: new Fill({ color: 'rgba(34,197,94,0.3)' }) }),
    }),
    new Style({
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({ color: '#22c55e' }),
        stroke: new Stroke({ color: '#ffffff', width: 2 }),
      }),
      text: new Text({
        text: label,
        font: 'bold 14px sans-serif',
        offsetY: -24,
        fill: new Fill({ color: '#ffffff' }),
        stroke: new Stroke({ color: 'rgba(0,0,0,0.7)', width: 4 }),
        backgroundFill: new Fill({ color: 'rgba(0,0,0,0.6)' }),
        padding: [4, 6, 4, 6],
      }),
    }),
  ];
}

/* ------------------------------- Component ------------------------------- */

function App() {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const guessSource = useRef(new VectorSource()).current;
  const revealSource = useRef(new VectorSource()).current;

  const [phase, setPhase] = useState<Phase>('menu');
  const [revealed, setRevealed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guessLonLat, setGuessLonLat] = useState<[number, number] | null>(null);
  const [answers, setAnswers] = useState<AnswerData[]>([]);
  const [sharedData, setSharedData] = useState<SharedResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Today's five cities + date key computed once on mount
  const dailyCities = useRef(getDailyCities(new Date())).current;
  const todayKey = useRef(getDateKey(new Date())).current;

  // Ref för att kartans klickhanterare ska se senaste state utan att kopplas om
  const stateRef = useRef({ phase, revealed });
  stateRef.current = { phase, revealed };

  const handleMapClickRef = useRef<(lonlat: [number, number]) => void>(() => {});
  handleMapClickRef.current = (lonlat) => {
    if (stateRef.current.phase === 'playing' && !stateRef.current.revealed) {
      setGuessLonLat(lonlat);
    }
  };

  // Initiera kartan (körs en gång)
  useEffect(() => {
    if (!mapElement.current) return;

    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
            attributions: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
          }),
        }),
        new VectorLayer({
          source: new VectorSource({
            url: '/data/ne_50m_admin_0_countries.json',
            format: new GeoJSON(),
          }),
          style: new Style({
            stroke: new Stroke({ color: '#c0c0c0', width: 0.8 }),
          }),
        }),
        new VectorLayer({ source: guessSource }),
        new VectorLayer({ source: revealSource }),
      ],
      view: new View({ center: fromLonLat([0, 0]), zoom: 2 }),
    });

    initialMap.on('singleclick', (evt) => {
      handleMapClickRef.current(toLonLat(evt.coordinate) as [number, number]);
    });

    mapRef.current = initialMap;

    return () => {
      initialMap.setTarget(undefined);
      if (mapRef.current === initialMap) mapRef.current = null;
    };
  }, [guessSource, revealSource]);

  // Placera/uppdatera gissningsmarkören
  useEffect(() => {
    guessSource.clear();
    if (phase === 'playing' && !revealed && guessLonLat) {
      const feature = new Feature({ geometry: new Point(fromLonLat(guessLonLat)) });
      feature.setStyle(guessMarkerStyle);
      guessSource.addFeature(feature);
    }
  }, [phase, revealed, guessLonLat, guessSource]);

  // Läs dela-länk vid start
  useEffect(() => {
    const data = parseShareHash(window.location.hash);
    if (data) {
      setSharedData(data);
      setPhase('shared');
    }
  }, []);

  // Update the page title
  useEffect(() => {
    document.title = 'CityQuiz – find the cities on the map';
  }, []);

  const currentCity = dailyCities[currentIndex];
  const lastAnswer = revealed ? answers[answers.length - 1] : null;
  const isLastRound = currentIndex === dailyCities.length - 1;
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const shareUrl = useMemo(() => {
    if (answers.length === 0) return '';
    const payload: SharedResult = {
      date: todayKey,
      results: answers.map((a) => ({
        n: a.city.name,
        c: a.city.country,
        d: a.distanceKm,
        s: a.score,
      })),
    };
    return buildShareLink(payload);
  }, [answers, todayKey]);

  const handleStart = useCallback(() => {
    setCopied(false);
    setAnswers([]);
    setGuessLonLat(null);
    setRevealed(false);
    setCurrentIndex(0);
    guessSource.clear();
    revealSource.clear();
    setPhase('playing');
    mapRef.current?.getView().animate({ center: fromLonLat([0, 0]), zoom: 2, duration: 300 });
  }, [guessSource, revealSource]);

  const handleConfirm = useCallback(() => {
    if (!guessLonLat || !currentCity || revealed) return;
    const [lon, lat] = guessLonLat;
    const dist = distanceKm(lat, lon, currentCity.lat, currentCity.lon);
    const answer: AnswerData = {
      city: currentCity,
      guess: { lat, lon },
      distanceKm: Math.round(dist),
      score: calculateScore(dist),
    };

    setAnswers((prev) => [...prev, answer]);
    setRevealed(true);

    // Rita rätt svar, avståndscirkel och linje på kartan
    revealSource.clear();
    const cityCoord = fromLonLat([currentCity.lon, currentCity.lat]);
    const guessCoord = fromLonLat([lon, lat]);

    const answerFeature = new Feature({ geometry: new Point(cityCoord) });
    answerFeature.setStyle(answerMarkerStyle(currentCity.name));

    const lineFeature = new Feature({ geometry: new LineString([guessCoord, cityCoord]) });
    lineFeature.setStyle(lineStyle);

    const circleFeature = new Feature({
      geometry: fromCircle(new CircleGeom(cityCoord, answer.distanceKm * 1000), 128),
    });
    circleFeature.setStyle(distanceCircleStyle);

    revealSource.addFeature(answerFeature);
    revealSource.addFeature(lineFeature);
    revealSource.addFeature(circleFeature);

    // Zooma ut så både gissning och rätt svar syns
    const map = mapRef.current;
    if (map) {
      const ext = createEmpty();
      extend(ext, new Point(guessCoord).getExtent());
      extend(ext, new Point(cityCoord).getExtent());
      map.getView().fit(ext, { padding: [90, 90, 90, 150], maxZoom: 12, duration: 500 });
    }
  }, [guessLonLat, currentCity, revealed, revealSource]);

  const handleNext = useCallback(() => {
    setCopied(false);
    revealSource.clear();
    guessSource.clear();
    setGuessLonLat(null);
    if (currentIndex < dailyCities.length - 1) {
      setCurrentIndex((i) => i + 1);
      setRevealed(false);
    } else {
      setPhase('results');
    }
  }, [currentIndex, dailyCities, revealSource, guessSource]);

  const resetViewToWorld = useCallback(() => {
    mapRef.current?.getView().animate({ center: fromLonLat([0, 0]), zoom: 2, duration: 300 });
  }, []);

  const handleCopyLink = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      /* ignore */
    }
  }, [shareUrl]);

  const handleShare = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.share({
        title: 'My CityQuiz result',
        text: `I got ${totalScore(answers)} out of 25,000 points in today's CityQuiz!`,
        url: shareUrl,
      });
    } catch {
      /* user cancelled */
    }
  }, [shareUrl, answers]);

  const handlePlayFromShared = useCallback(() => {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    setSharedData(null);
    resetViewToWorld();
    setPhase('menu');
  }, [resetViewToWorld]);

  const renderResultRows = (
    rows: { name: string; country: string; distance: number; score: number }[]
  ) => (
    <table className="result-table" style={{ width: '100%', borderCollapse: 'collapse', margin: '8px 0 12px' }}>
      <thead>
        <tr>
          <th style={thStyle}>#</th>
          <th style={thStyle}>City</th>
          <th style={thStyle}>Distance</th>
          <th style={{ ...thStyle, textAlign: 'right' }}>Score</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={i % 2 === 1 ? { backgroundColor: theme.tableStripe } : undefined}>
            <td style={tdStyle}>{i + 1}</td>
            <td className="city-cell" style={tdStyle}>
              {r.name} <span className="country-label" style={{ color: theme.textSecondary, fontSize: 13 }}>({r.country})</span>
            </td>
            <td style={tdStyle}>{r.distance.toLocaleString('en-US')} km</td>
            <td style={{ ...tdStyle, textAlign: 'right' }}>{r.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const currentTotal = totalScore(answers);
  const sharedTotal = sharedData ? sharedData.results.reduce((sum, r) => sum + r.s, 0) : 0;

  return (
    <>
      <div
        ref={mapElement}
        className="map-container"
        style={{ position: 'absolute', inset: 0 }}
      />

      {/* Start menu */}
      {phase === 'menu' && (
        <div style={overlayStyle}>
          <div style={cardStyle}>
            <h1 style={{ margin: '0 0 8px', fontSize: 26 }}>Find the city on the map!</h1>
            <p style={{ margin: '0 0 8px', lineHeight: 1.5 }}>
              Guess where five cities are located on the world map. Click on the map to place your
              guess – the closer you are, the more points you get. Max 5,000 points per city, 25,000 total.
            </p>
            <p style={{ margin: '0 0 16px', color: theme.textSecondary, fontSize: 14 }}>
              Today's five cities: {todayKey}
            </p>
            <button onClick={handleStart} style={{ ...primaryBtn, fontSize: 17, padding: '12px 24px' }}>
              Start game
            </button>
          </div>
        </div>
      )}

      {/* Playing phase */}
      {phase === 'playing' && (
        <div style={topOverlayStyle}>
          <div style={topCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 13, color: theme.textSecondary, fontWeight: 600 }}>
                  Round {currentIndex + 1} of {dailyCities.length}
                </div>
                <div style={{ fontSize: 19, fontWeight: 700, marginTop: 2 }}>
                  Where is {currentCity.name}?
                </div>
                <div style={{ fontSize: 14, color: theme.textSecondary }}>{currentCity.country}</div>
              </div>
              <div
                style={{
                  backgroundColor: theme.accentLight,
                  color: theme.accentHover,
                  borderRadius: theme.borderRadius,
                  padding: '6px 12px',
                  fontSize: 14,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                {currentTotal.toLocaleString('en-US')} p
              </div>
            </div>

            {!revealed ? (
              <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                {guessLonLat ? (
                  <>
                    <button onClick={handleConfirm} style={primaryBtn} disabled={!guessLonLat}>
                      Confirm guess
                    </button>
                    <button onClick={() => setGuessLonLat(null)} style={ghostBtn}>
                      Clear
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: 14, color: theme.textSecondary }}>
                    Click on the map to place your guess
                  </span>
                )}
              </div>
            ) : (
              lastAnswer && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, fontSize: 15, minWidth: 180 }}>
                    You were{' '}
                    <strong>{lastAnswer.distanceKm.toLocaleString('en-US')} km</strong> away ·{' '}
                    <strong>+{lastAnswer.score}</strong> points
                  </div>
                  <button onClick={handleNext} style={primaryBtn}>
                    {isLastRound ? 'Show results' : 'Next city'}
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {phase === 'results' && (
        <div style={overlayStyle}>
          <div style={cardStyle}>
            <h2 style={{ margin: '0 0 4px' }}>Your results</h2>
            <p style={{ margin: '0 0 8px', color: theme.textSecondary, fontSize: 14 }}>Today's cities: {todayKey}</p>
            {renderResultRows(
              answers.map((a) => ({
                name: a.city.name,
                country: a.city.country,
                distance: a.distanceKm,
                score: a.score,
              }))
            )}
            <div style={totalRowStyle}>
              <span>Total</span>
              <span>{currentTotal.toLocaleString('en-US')} / 25,000</span>
            </div>
            <div style={gradeStyle}>
              {gradeFor(currentTotal)}
            </div>

            <div style={shareUrlStyle}>
              {shareUrl}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={handleCopyLink} style={primaryBtn}>
                {copied ? 'Copied!' : 'Copy share link'}
              </button>
              {canShare && (
                <button onClick={handleShare} style={ghostBtn}>
                  Share...
                </button>
              )}
              <button onClick={handleStart} style={ghostBtn}>
                Play again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared result (someone opened a link) */}
      {phase === 'shared' && sharedData && (
        <div style={overlayStyle}>
          <div style={cardStyle}>
            <h2 style={{ margin: '0 0 4px' }}>Result from a friend</h2>
            <p style={{ margin: '0 0 8px', color: theme.textSecondary, fontSize: 14 }}>{sharedData.date}</p>
            {renderResultRows(
              sharedData.results.map((r) => ({
                name: r.n,
                country: r.c,
                distance: r.d,
                score: r.s,
              }))
            )}
            <div style={totalRowStyle}>
              <span>Total</span>
              <span>{sharedTotal.toLocaleString('en-US')} / 25,000</span>
            </div>
            <div style={gradeStyle}>
              {gradeFor(sharedTotal)}
            </div>
            <button onClick={handlePlayFromShared} style={primaryBtn}>
              Play yourself
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
