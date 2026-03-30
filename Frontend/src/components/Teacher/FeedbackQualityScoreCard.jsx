import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, RadialLinearScale } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FaStar, FaExpandAlt, FaCompressAlt, FaEye, FaUser } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend, RadialLinearScale);

const FeedbackQualityScoreCard = ({ examId, onClose }) => {
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedReviewer, setExpandedReviewer] = useState(null);
  const [selectedTab, setSelectedTab] = useState('all');

  useEffect(() => {
    fetchQualityScores();
  }, [examId]);

  const fetchQualityScores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/teacher/feedback-quality/${examId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setReviewers(data || []);
    } catch (error) {
      console.error('Failed to fetch quality scores:', error);
      setReviewers([]);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (score) => {
    if (score >= 90) return '#2e7d32'; // Excellent - Green
    if (score >= 80) return '#4caf50'; // Good - Light Green
    if (score >= 70) return '#8bc34a'; // Average - Yellow Green
    if (score >= 60) return '#ffc107'; // Weak - Yellow
    return '#f44336'; // Poor - Red
  };

  const getGradeLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    if (score >= 60) return 'Weak';
    return 'Poor';
  };

  const filteredReviewers = selectedTab === 'all' 
    ? reviewers 
    : reviewers.filter(r => getGradeLabel(r.score) === selectedTab);

  if (loading) {
    return (
      <div className="quality-score-overlay" style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1300
      }}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #e3f2fd', borderTop: '4px solid #4b3c70', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <span style={{ fontSize: '1.2rem', color: '#4b3c70' }}>Loading Feedback Quality Scores...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quality-score-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1300, padding: '2rem'
    }}>
      <div style={{
        background: 'white', minWidth: '90vw', maxWidth: '1400px', maxHeight: '90vh', borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(75,60,112,0.3)', overflow: 'hidden', display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>
              <FaStar style={{ marginRight: '0.5rem', color: '#ffd700' }} /> Feedback Quality Score Cards
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9 }}>Reviewer quality assessment (0-100)</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select 
              value={selectedTab} 
              onChange={(e) => setSelectedTab(e.target.value)}
              style={{
                padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 500
              }}
            >
              <option value="all">All Reviewers</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Average">Average</option>
              <option value="Weak">Weak</option>
              <option value="Poor">Poor</option>
            </select>
            <button onClick={onClose} style={{
              padding: '0.75rem 1.5rem', borderRadius: '10px', background: 'rgba(255,255,255,0.2)',
              border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(10px)'
            }}>
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem', overflow: 'auto', flex: 1 }}>
          {reviewers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#666' }}>
              <FaEye style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#4b3c70' }}>No Feedback Quality Data</h3>
              <p>Run evaluation flagging first to generate quality scores</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem' }}>
              {filteredReviewers.map((reviewer, idx) => (
                <div key={idx} style={{
                  background: 'linear-gradient(145deg, #f8f9ff, #f0f2ff)', borderRadius: '20px',
                  padding: '2rem', boxShadow: '0 10px 40px rgba(75,60,112,0.15)', border: '1px solid rgba(102,126,234,0.1)',
                  transition: 'all 0.3s ease', cursor: 'pointer',
                  transform: expandedReviewer === idx ? 'scale(1.02)' : 'scale(1)',
                  position: 'relative', overflow: 'hidden'
                }} onClick={() => setExpandedReviewer(expandedReviewer === idx ? null : idx)}>
                  
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{
                      width: '60px', height: '60px', borderRadius: '50%', background: getGradeColor(reviewer.score),
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <FaUser style={{ color: 'white', fontSize: '1.5rem' }} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#2d3748' }}>
                        {reviewer.name}
                      </h3>
                      <div style={{ fontSize: '0.9rem', color: '#718096', fontWeight: 500 }}>
                        {getGradeLabel(reviewer.score)} • Score: {reviewer.score.toFixed(0)}
                      </div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      {expandedReviewer === idx ? <FaCompressAlt /> : <FaExpandAlt />}
                    </div>
                  </div>

                  {/* Radial Gauge */}
                  <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto' }}>
                      <Doughnut
                        data={{
                          datasets: [{
                            data: [reviewer.score, 100 - reviewer.score],
                            backgroundColor: [getGradeColor(reviewer.score), 'rgba(0,0,0,0.05)'],
                            borderWidth: 0,
                            cutout: '70%'
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          rotation: -90,
                          circumference: 180,
                          plugins: {
                            legend: { display: false },
                            tooltip: { enabled: false }
                          }
                        }}
                      />
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        textAlign: 'center', pointerEvents: 'none'
                      }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: getGradeColor(reviewer.score), lineHeight: 1 }}>
                          {reviewer.score.toFixed(0)}<span style={{ fontSize: '0.8em' }}>%</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>
                          Quality Score
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown Bars */}
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {[
                      { label: 'Word Count (35%)', value: reviewer.breakdown.wordCount, color: '#48bb78' },
                      { label: 'Rating Spread (25%)', value: reviewer.breakdown.ratingSpread, color: '#ed8936' },
                      { label: 'Completeness (25%)', value: reviewer.breakdown.completeness, color: '#4299e1' },
                      { label: 'Timeliness (15%)', value: reviewer.breakdown.timeliness, color: '#9f7aea' }
                    ].map((metric, mIdx) => (
                      <div key={mIdx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1, color: '#4a5568', fontWeight: 500 }}>{metric.label}</div>
                        <div style={{ width: '120px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${metric.value}%`, height: '100%', background: metric.color,
                            borderRadius: '4px', transition: 'width 1.5s ease-out', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }} />
                        </div>
                        <span style={{ fontWeight: 600, color: metric.color, minWidth: '40px', textAlign: 'right' }}>
                          {metric.value.toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>

                  {expandedReviewer === idx && (
                    <div style={{ 
                      marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(102,126,234,0.05)', 
                      borderRadius: '12px', borderLeft: '4px solid #667eea'
                    }}>
                      <h4 style={{ margin: '0 0 1rem 0', color: '#4b3c70', fontWeight: 700 }}>Detailed Breakdown</h4>
                      <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#4a5568' }}>
                        <div><strong>Total Evaluations:</strong> {reviewer.totalEvaluations}</div>
                        <div><strong>Avg Words per Feedback:</strong> {reviewer.avgWords?.toFixed(1) || 'N/A'}</div>
                        <div><strong>Score Variance:</strong> {reviewer.scoreVariance?.toFixed(2) || 'N/A'}</div>
                        <div><strong>Avg Days Before Deadline:</strong> {reviewer.avgDaysBefore?.toFixed(1) || 'N/A'}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div style={{
          padding: '1.5rem 2rem', background: 'rgba(75,60,112,0.05)', borderTop: '1px solid rgba(102,126,234,0.1)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '2rem', fontSize: '0.95rem', color: '#718096' }}>
            <span>Total Reviewers: <strong>{reviewers.length}</strong></span>
            <span>Avg Quality: <strong>{reviewers.length > 0 ? reviewers.reduce((a,b)=>a+b.score,0)/reviewers.length : 0 | 0}%</strong></span>
          </div>
          <button onClick={onClose} style={{
            padding: '0.75rem 2rem', borderRadius: '12px', background: '#4b3c70', border: 'none',
            color: 'white', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
          }}>
            Done
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FeedbackQualityScoreCard;

