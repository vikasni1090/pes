import React from 'react';

export default function EnrollmentRequestSection({
  availableCourses,
  selectedCourse,
  setSelectedCourse,
  availableBatches,
  selectedBatch,
  setSelectedBatch,
  handleEnrollmentRequest,
}) {
  return (
    <div style={{ width: '100%' }}>
      <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1.2rem', letterSpacing: '0.5px', color: '#4b3c70' }}>
        Available Courses
      </h3>

      {availableCourses.length === 0 ? (
        <p style={{ color: '#888', fontStyle: 'italic' }}>No courses available to join.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {availableCourses.map((course) => {
            const isPending = course.enrollmentStatus === 'pending';
            const isSelected = selectedCourse === course._id && !isPending;
            const batches = isSelected ? availableBatches : [];
            return (
              <div
                key={course._id}
                style={{
                  border: isPending ? '2px solid #e67e22' : isSelected ? '2px solid #4b3c70' : '1.5px solid #c8c0dd',
                  borderRadius: '14px',
                  padding: '1.2rem 1.5rem',
                  minWidth: '220px',
                  maxWidth: '300px',
                  flex: '1 1 220px',
                  background: isPending ? '#fff8f0' : isSelected ? '#f5f3ff' : '#fff',
                  boxShadow: isSelected ? '0 4px 12px rgba(75,60,112,0.18)' : '0 2px 6px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s',
                  cursor: isPending ? 'default' : 'pointer',
                }}
                onClick={() => {
                  if (isPending) return;
                  setSelectedCourse(isSelected ? '' : course._id);
                  setSelectedBatch('');
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#3f3d56', marginBottom: '0.3rem' }}>
                  {course.courseName}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#888', marginBottom: '0.6rem' }}>
                  {course.courseId}
                </div>

                {isPending && (
                  <span style={{ display: 'inline-block', background: '#e67e22', color: '#fff', borderRadius: '12px', padding: '0.2rem 0.75rem', fontSize: '0.78rem', fontWeight: 600 }}>
                    ⏳ Pending Approval
                  </span>
                )}

                {isSelected && (
                  <form
                    onSubmit={handleEnrollmentRequest}
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.4rem' }}
                  >
                    <select
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      style={{
                        padding: '0.5rem 0.8rem',
                        borderRadius: '8px',
                        border: '1.5px solid #4b3c70',
                        fontSize: '0.9rem',
                        background: '#fff',
                        color: '#4b3c70',
                        fontWeight: 500,
                        width: '100%',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">Select Batch</option>
                      {batches.map((batch) => (
                        <option key={batch._id} value={batch._id}>
                          {batch.batchId}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={!selectedBatch}
                      style={{
                        background: selectedBatch ? '#4b3c70' : '#a0a0a0',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.55rem 1rem',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: selectedBatch ? 'pointer' : 'not-allowed',
                        width: '100%',
                      }}
                    >
                      Join
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}