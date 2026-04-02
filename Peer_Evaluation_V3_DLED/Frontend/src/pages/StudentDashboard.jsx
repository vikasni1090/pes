import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileMenu from '../components/User/ProfileMenu';
import AnnouncementBanner from '../components/AnnouncementBanner';
import { AppContext } from '../utils/AppContext';
import { useContext } from 'react';
import '../styles/Student/StudentDashboard.css';
import EnrolledCoursesSection from '../components/Student/EnrolledCoursesSection';
import EnrollmentRequestSection from '../components/Student/EnrollmentRequestSection';
import StudentExamsTab from '../components/Student/StudentExamsTab';
import EvaluationsTable from '../components/Student/EvaluationTable';
import ResultsTable from '../components/Student/ResultsTable';
import PeerResultOverlay from '../components/Student/PeerResultOverlay';
import StudentExamHistoryOverlay from '../components/Student/StudentExamHistoryOverlay';
import TAPanel from '../components/TA/TAPanel';
import TAEvalOverlay from '../components/TA/TAEvalOverlay';
import { containerStyle, sidebarStyle, mainStyle, contentStyle, sidebarToggleBtnStyle, buttonStyle, sectionHeading } from '../styles/Student/StudentDashboard.js'
import { FaBook, FaClipboardList, FaLaptopCode, FaHome, FaFileAlt, FaChartBar, FaUserGraduate, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { showMessage } from '../utils/Message';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState({ name: '', email: '', role: '', isTA: false });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [taBatchInfo, setTaBatchInfo] = useState(null);
  const [selectedTABatch, setSelectedTABatch] = useState('');
  const [dashboardStats, setDashboardStats] = useState({ courses: 0, pendingEvaluations: 0, activeExams: 0 });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [studentBatches, setStudentBatches] = useState([]);
  const [selectedBatchForExam, setSelectedBatchForExam] = useState('');
  const [batchExams, setBatchExams] = useState([]);
  const [examFileMap, setExamFileMap] = useState({});
  const [selectedExam, setSelectedExam] = useState('');
  const [evaluationExams, setEvaluationExams] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showTAManageOverlay, setShowTAManageOverlay] = useState(false);
  const [manageTAData, setManageTAData] = useState(null);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [flaggedEvaluations, setFlaggedEvaluations] = useState([]);
  const [selectedTAExam, setSelectedTAExam] = useState("");
  const [showTAEvalOverlay, setShowTAEvalOverlay] = useState(false);
  const [selectedTAEvaluation, setSelectedTAEvaluation] = useState(null);
  const [resultsBatches, setResultsBatches] = useState([]);
  const [selectedResultsBatch, setSelectedResultsBatch] = useState("");
  const [resultExams, setResultExams] = useState([]);
  const [isPeerResultOverlayOpen, setIsPeerResultOverlayOpen] = useState(false);
  const [selectedExamForPeerResult, setSelectedExamForPeerResult] = useState(null);
  const [peerResultsForExam, setPeerResultsForExam] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState({});
  const fileInputRefs = useRef({});
  const [examHistoryOverlayOpen, setExamHistoryOverlayOpen] = useState(false);
  const [completedExams, setCompletedExams] = useState([]);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, announcement, announcementDismissed, dismissAnnouncement } = useContext(AppContext);

  useEffect(() => {
    document.body.style.background = '';
    document.body.style.margin = '0';
    document.body.style.minHeight = '100vh';
    return () => {
      document.body.style.margin = '';
      document.body.style.minHeight = '';
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    fetch('http://localhost:5000/api/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data?._id) setUser(data);
        else navigate('/login');
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  useEffect(() => {
    fetchTABatchInfo();
  }, [user.isTA]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  useEffect(() => {
    if (activeTab !== 'home') return;
    fetchDashboardStats();
  }, [activeTab]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://localhost:5000/api/student/enrolled-courses', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setEnrolledCourses(Array.isArray(data) ? data : []))
      .catch(() => setEnrolledCourses([]));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://localhost:5000/api/student/available-courses', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setAvailableCourses(Array.isArray(data) ? data : []))
      .catch(() => setAvailableCourses([]));
  }, []);

  useEffect(() => {
    if (!selectedCourse) {
      setAvailableBatches([]);
      setSelectedBatch('');
      return;
    }
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5000/api/student/course-batches/${selectedCourse}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setAvailableBatches(Array.isArray(data) ? data : []))
      .catch(() => setAvailableBatches([]));
  }, [selectedCourse]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://localhost:5000/api/student/enrolled-batches', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setStudentBatches(Array.isArray(data) ? data : []))
      .catch(() => setStudentBatches([]));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    let url = 'http://localhost:5000/api/student/all-exams';
    if (selectedBatchForExam) url += `?batchId=${selectedBatchForExam}`;
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setBatchExams(Array.isArray(data) ? data : []))
      .catch(() => setBatchExams([]));
  }, [selectedBatchForExam]);

  useEffect(() => {
    if (activeTab !== 'evaluation') return;
    fetchEvaluations();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'result') {
      fetchResultsBatches();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedResultsBatch) {
      fetchResultExams();
    }
  }, [selectedResultsBatch]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/student/dashboard-stats', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (
        typeof data === 'object' &&
        data !== null &&
        'coursesEnrolled' in data &&
        'pendingEvaluations' in data &&
        'activeExams' in data
      ) {
        setDashboardStats({
          courses: data.coursesEnrolled,
          pendingEvaluations: data.pendingEvaluations,
          activeExams: data.activeExams,
        });
      } else {
        console.error('Invalid dashboard stats response:', data);
        setDashboardStats({ courses: 0, pendingEvaluations: 0, activeExams: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setDashboardStats({ courses: 0, pendingEvaluations: 0, activeExams: 0 });
    }
  };

  const fetchTABatchInfo = async () => {
    const token = localStorage.getItem('token');
    if (!token || !user.isTA) return;
    try {
      const res = await fetch('http://localhost:5000/api/ta/my-batches', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data) {
        setTaBatchInfo(Array.isArray(data) ? data : [data]);
      }
    } catch (error) {
      console.error("Failed to fetch TA batch info:", error);
    }
  };

  const fetchEvaluations = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let url = 'http://localhost:5000/api/student/evaluations';

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        setEvaluations(data);

        const uniqueExams = data.reduce((acc, evaluation) => {
          if (!acc.some(exam => exam.examId === evaluation.examId)) {
            acc.push({ examId: evaluation.examId, name: evaluation.examName, courseName: evaluation.courseName, batchName: evaluation.batchId });
          }
          return acc;
        }, []);

        setEvaluationExams(uniqueExams);
      } else {
        setEvaluations([]);
        setEvaluationExams([]);
      }
    } catch (error) {
      console.error('Failed to fetch evaluations:', error);
      setEvaluations([]);
      setEvaluationExams([]);
    }
  };

  const fetchResultsBatches = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5000/api/student/results-batches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setResultsBatches(data);
      }
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const fetchResultExams = async () => {
    const token = localStorage.getItem('token');
    if (!token || !selectedResultsBatch) return;
    try {
      const response = await fetch(`http://localhost:5000/api/student/result-batch-exams/${selectedResultsBatch}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setResultExams(data);
      }
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const handleEnrollmentRequest = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !selectedBatch) {
      showMessage('Please select both course and batch.');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/student/request-enrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId: selectedCourse, batchId: selectedBatch }),
      });
      const data = await response.json();
      if (response.ok) {
        showMessage(data.message, 'success');
        // Mark the course as pending in the local state instead of removing it
        setAvailableCourses(prev => prev.map(c => c._id === selectedCourse ? { ...c, enrollmentStatus: 'pending' } : c));
      } else {
        showMessage(data.message || 'Failed to send enrollment request.', 'error');
      }
    } catch (error) {
      showMessage('Failed to send enrollment request.', 'error');
    }
    setSelectedCourse('');
    setSelectedBatch('');
  };

  const handleExamFileChange = (examId, file) => {
    setExamFileMap(prev => ({ ...prev, [examId]: file }));
  };

  const handleExamFileUpload = async (examId) => {
    const file = examFileMap[examId];
    if (!file) return;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('examId', examId);

    try {
      const response = await fetch('http://localhost:5000/api/student/upload-exam-document', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        showMessage(data.message, 'success');
      }
      else if (response.status === 409) {
        showMessage(data.message, 'info');
      } else {
        showMessage(data.message || 'Upload failed!', 'error');
      }
    } catch {
      showMessage('Upload failed!', 'error');
    }
    setExamFileMap(prev => ({ ...prev, [examId]: null }));
    if (fileInputRefs.current[examId]) {
      fileInputRefs.current[examId].value = "";
    }
  };

  const handleEvaluateClick = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setIsOverlayOpen(true);
  };

  const closeEvalOverlay = () => {
    setIsOverlayOpen(false);
    setSelectedEvaluation(null);
  };

  const handleEvaluationSubmit = async (e, selectedEvaluation) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const marks = [];
    const feedback = [];

    Array.from(e.target.elements).forEach((element) => {
      if (element.type === "number" && element.placeholder === "Marks") {
        marks.push(Number(element.value));
      }
      if (element.type === "text" && element.placeholder === "Feedback") {
        feedback.push(element.value);
      }
    });

    const totalMarks = marks.reduce((sum, mark) => sum + mark, 0);

    if (totalMarks > selectedEvaluation.examTotalMarks) {
      showMessage(`The total marks ${totalMarks} exceed the allowed maximum ${selectedEvaluation.examTotalMarks} marks. Please check the marks.`, "error");
      return;
    }

    const evaluationData = {
      evaluationId: selectedEvaluation.evaluationId,
      examId: selectedEvaluation?.examId,
      marks,
      feedback,
    };

    try {
      const response = await fetch("http://localhost:5000/api/student/submit-evaluation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(evaluationData),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message || "Evaluation submitted successfully!", "success");
        closeEvalOverlay();
        fetchEvaluations();
      } else {
        showMessage(data.message || "Failed to submit evaluation!", "error");
      }
    } catch (error) {
      showMessage("Error submitting evaluation!", "error");
    }
  };

  const handleTAManageClick = async (assignment) => {
    setManageTAData(assignment);
    setShowTAManageOverlay(true);
    const enrollmentsData = await fetchTAPendingEnrollments(assignment.batch_id);
    setPendingEnrollments(enrollmentsData);
    const evaluationsData = await fetchTAFlaggedEvaluations(assignment.batch_id);
    setFlaggedEvaluations(evaluationsData);
  };

  const closeTAManageOverlay = () => {
    setShowTAManageOverlay(false);
    setManageTAData(null);
    setPendingEnrollments([]);
    setFlaggedEvaluations([]);
  };

  const fetchTAPendingEnrollments = async (batchId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/ta/pending_enrollments/${batchId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok && data) {
        return Array.isArray(data) ? data : [data];
      }
    } catch (error) {
      console.error("Failed to fetch pending enrollments:", error);
    }
    return [];
  };

  const fetchTAFlaggedEvaluations = async (batchId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/ta/flagged_evaluations/${batchId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (res.ok && data) {
        return Array.isArray(data) ? data : [data];
      }
    } catch (error) {
      console.error("Failed to fetch flagged evaluations:", error);
    }
    return [];
  };

  const acceptEnrollment = async (enrollmentId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/ta/accept/${enrollmentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        showMessage(data.message, "success");
        const updatedEnrollments = await fetchTAPendingEnrollments(manageTAData.batch_id);
        setPendingEnrollments(updatedEnrollments);
      } else {
        showMessage(data.message || "Failed to accept enrollment.", "error");
      }
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  const declineEnrollment = async (enrollmentId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/ta/decline/${enrollmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        showMessage(data.message, "success");
        const updatedEnrollments = await fetchTAPendingEnrollments(manageTAData.batch_id);
        setPendingEnrollments(updatedEnrollments);
      }
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  const TAEditEval = async (evaluation) => {
    setSelectedTAEvaluation(evaluation);
    setShowTAEvalOverlay(true);
  };

  const TAFlagEval = async (evaluation) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/ta/flag-evaluation/${evaluation._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message, "success");
        if (manageTAData?.batch_id) {
          const evaluationsData = await fetchTAFlaggedEvaluations(manageTAData.batch_id);
          setFlaggedEvaluations(evaluationsData);
        }
      } else {
        showMessage(data.message, "error");
      }
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  const TADelEval = async (evaluation) => {
    try {
      const token = localStorage.getItem('token');

      if (evaluation?.eval_status === 'pending') {
        showMessage("Cannot remove/reject pending evaluations!", "error");
        return;
      }
      const response = await fetch(`http://localhost:5000/api/ta/remove-evaluation/${evaluation._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message, "success");
        if (manageTAData?.batch_id) {
          const evaluationsData = await fetchTAFlaggedEvaluations(manageTAData.batch_id);
          setFlaggedEvaluations(evaluationsData);
        }
      } else {
        showMessage(data.message, "error");
      }
    } catch (error) {
      showMessage("Error rejecting evaluation!", "error");
    }
  };

  const closeTAEvalOverlay = () => {
    setShowTAEvalOverlay(false);
    setSelectedTAEvaluation(null);
  };

  const handleTAEvaluationUpdate = async (updateData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/ta/update-evaluation/${updateData.evaluationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          score: updateData.score,
          feedback: updateData.feedback,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message || "Evaluation updated successfully!", "success");
        closeTAEvalOverlay();
        if (manageTAData?.batch_id) {
          const evaluationsData = await fetchTAFlaggedEvaluations(manageTAData.batch_id);
          setFlaggedEvaluations(evaluationsData);
        }
      } else {
        showMessage(data.message || "Failed to update evaluation!", "error");
      }
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  const handleViewPeerResults = async (exam) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:5000/api/student/peer-result-evals/${exam._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        setPeerResultsForExam(data);
        setSelectedExamForPeerResult(exam);
        setIsPeerResultOverlayOpen(true);
      }
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const closePeerResultOverlay = () => {
    setIsPeerResultOverlayOpen(false);
    setSelectedExamForPeerResult(null);
    setPeerResultsForExam([]);
  };

  const handleRaiseTicket = async (evaluationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/student/raise-ticket/${evaluationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showMessage(data.message, 'success');
        if (selectedExamForPeerResult) {
          handleViewPeerResults(selectedExamForPeerResult);
        }
      } else if (response.status === 409) {
        showMessage(data.message, 'info');
      } else {
        showMessage(data.message, 'error');
      }
    } catch (error) {
      showMessage('Failed to raise ticket!', 'error');
    }
  };

  const handleExamHistory = async () => {
    await fetchCompletedExams();
    setExamHistoryOverlayOpen(true);
  };

  const fetchCompletedExams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/student/completed-exams', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setCompletedExams(data);
      } else {
        setCompletedExams([]);
      }
    } catch (error) {
      setCompletedExams([]);
    }
  };

  const handleSidebarToggle = () => setSidebarOpen(open => !open);

  const playTick = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } catch (_) {}
  };

  return (
    <div
      className={`student-dashboard-bg${sidebarOpen ? ' sidebar-open' : ''}`}
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: darkMode
          ? 'linear-gradient(135deg, #0f172a 0%, #1e2d4a 100%)'
          : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        display: 'flex',
        flexDirection: 'row',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        boxSizing: 'border-box',
        minWidth: '500px',
        overflowX: 'auto',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: ' #4b3c70 transparent',
      }}
    >
      {/* Profile Icon Dropdown Top Right */}
      <div style={{
        position: 'fixed',
        top: 24,
        right: 36,
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
      }}>
        <ProfileMenu
          user={user}
          onLogout={logout}
          onProfile={() => setActiveTab('profile')}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onAvatarUpdate={(url) => setUser(prev => ({ ...prev, profilePicture: url }))}
        />
      </div>

      {/* Sidebar toggle moved inside sidebar */}

      {/* Sidebar */}
      <div
        className={`student-dashboard-sidebar${sidebarOpen ? ' open' : ' collapsed'}`}
        style={{
          ...sidebarStyle,
          position: 'relative',
          height: 'auto',
          minHeight: '100vh',
          zIndex: 1000,
          width: sidebarOpen ? '230px' : '64px',
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
          padding: '1.25rem 0.75rem',
          gap: '0.2rem',
        }}
      >
        {/* Header / Toggle button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0 0.1rem' }}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            title={sidebarOpen ? 'Collapse' : 'Expand'}
            style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.13)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', color: 'white', transition: 'background 0.2s' }}
          >
            {sidebarOpen ? <FaTimes size={14} /> : <FaBars size={14} />}
          </button>
          <span style={{ fontSize: '0.98rem', fontWeight: 700, color: 'rgba(255,255,255,0.92)', whiteSpace: 'nowrap', overflow: 'hidden', opacity: sidebarOpen ? 1 : 0, maxWidth: sidebarOpen ? '160px' : '0', transition: 'opacity 0.2s, max-width 0.3s' }}>
            Student Panel
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 0 0.6rem' }} />

        {/* Nav items */}
        {[
          { tab: 'home',       label: 'Home',        Icon: FaHome },
          { tab: 'course',     label: 'Courses',     Icon: FaBook },
          { tab: 'exam',       label: 'Exams',       Icon: FaFileAlt },
          { tab: 'evaluation', label: 'Evaluations', Icon: FaClipboardList },
          { tab: 'result',     label: 'Results',     Icon: FaChartBar },
          ...(user.isTA ? [{ tab: 'ta', label: 'TA Panel', Icon: FaUserGraduate }] : []),
        ].map(({ tab, label, Icon }) => (
          <button
            key={tab}
            onClick={() => { playTick(); setActiveTab(tab); }}
            title={!sidebarOpen ? label : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.85rem',
              width: '100%', boxSizing: 'border-box', border: 'none',
              borderLeft: activeTab === tab ? '3px solid rgba(255,255,255,0.88)' : '3px solid transparent',
              borderRadius: '10px', padding: '0.68rem 0.75rem', cursor: 'pointer',
              whiteSpace: 'nowrap', overflow: 'hidden', textAlign: 'left',
              background: activeTab === tab ? 'rgba(255,255,255,0.15)' : 'transparent',
              color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.68)',
              fontWeight: activeTab === tab ? 700 : 400, fontSize: '0.9rem',
              transition: 'background 0.2s, color 0.2s, border-left 0.2s',
            }}
          >
            <Icon size={17} style={{ flexShrink: 0 }} />
            <span style={{ opacity: sidebarOpen ? 1 : 0, maxWidth: sidebarOpen ? '150px' : '0', transition: 'opacity 0.2s, max-width 0.3s', overflow: 'hidden' }}>
              {label}
            </span>
          </button>
        ))}

        {/* Spacer pushes logout to bottom */}
        <div style={{ flex: 1 }} />

        {/* Bottom divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />

        {/* Logout */}
        <button
          onClick={logout}
          title={!sidebarOpen ? 'Logout' : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.85rem',
            width: '100%', boxSizing: 'border-box',
            border: 'none', borderLeft: '3px solid transparent',
            borderRadius: '10px', padding: '0.68rem 0.75rem', cursor: 'pointer',
            background: 'transparent', color: 'rgba(255,160,160,0.85)',
            fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          <FaSignOutAlt size={17} style={{ flexShrink: 0 }} />
          <span style={{ opacity: sidebarOpen ? 1 : 0, maxWidth: sidebarOpen ? '120px' : '0', transition: 'opacity 0.2s, max-width 0.3s', overflow: 'hidden' }}>
            Logout
          </span>
        </button>
      </div>

      {/* Main Content */}
      <main
        className={`student-dashboard-main${sidebarOpen ? ' sidebar-open' : ''}`}
        style={{
          ...mainStyle,
          marginLeft: 0,
          alignItems: 'stretch',
          justifyContent: 'center',
        }}
      >
        {announcement && !announcementDismissed && (
          <AnnouncementBanner message={announcement.message} onDismiss={dismissAnnouncement} />
        )}
        <div className="student-dashboard-content" style={{
          ...contentStyle,
          background: darkMode ? 'rgba(15,23,42,0.97)' : 'rgba(255,255,255,0.97)',
          boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(30,58,138,0.12)',
          border: darkMode ? '1.5px solid rgba(59,130,246,0.2)' : '1.5px solid rgba(147,197,253,0.4)',
          maxWidth: 'none',
          width: '100%',
          height: '80vh',
          minHeight: '500px',
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          padding: '2.5rem 3rem',
          minWidth: '950px',
          overflowY: 'auto',
          overflowX: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#93c5fd transparent',
        }}>
          {activeTab === 'home' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', color: darkMode ? '#e0f2fe' : '#1e3a8a' }}>
              {/* Greeting */}
              <div style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ ...sectionHeading, textAlign: 'left', marginBottom: '0.35rem' }}>
                  Welcome back, {user.name ? user.name.split(' ')[0] : 'Student'} 👋
                </h2>
                <p style={{ margin: 0, color: darkMode ? '#7dd3fc' : '#64748b', fontSize: '0.95rem' }}>
                  Here's a snapshot of your academic activity.
                </p>
              </div>

              {/* Stat Cards */}
              <div style={{ display: 'flex', gap: '1.25rem', width: '100%', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
                <div className="dashboard-card" style={{ flex: '1 1 150px', textAlign: 'center', padding: '1.5rem 1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', boxShadow: '0 8px 24px rgba(59,130,246,0.35)', color: '#fff' }}>
                  <FaBook size={30} style={{ marginBottom: '0.6rem', opacity: 0.88 }} />
                  <p style={{ fontSize: '0.7rem', fontWeight: 600, margin: '0 0 0.4rem', opacity: 0.78, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Courses Enrolled</p>
                  <p style={{ fontWeight: 800, fontSize: '2.4rem', margin: 0, lineHeight: 1 }}>{dashboardStats.courses}</p>
                </div>
                <div className="dashboard-card" style={{ flex: '1 1 150px', textAlign: 'center', padding: '1.5rem 1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #11998e, #38ef7d)', boxShadow: '0 8px 24px rgba(17,153,142,0.3)', color: '#fff' }}>
                  <FaClipboardList size={30} style={{ marginBottom: '0.6rem', opacity: 0.88 }} />
                  <p style={{ fontSize: '0.7rem', fontWeight: 600, margin: '0 0 0.4rem', opacity: 0.78, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pending Evaluations</p>
                  <p style={{ fontWeight: 800, fontSize: '2.4rem', margin: 0, lineHeight: 1 }}>{dashboardStats.pendingEvaluations}</p>
                </div>
                <div className="dashboard-card" style={{ flex: '1 1 150px', textAlign: 'center', padding: '1.5rem 1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #43cea2, #185a9d)', boxShadow: '0 8px 24px rgba(67,206,162,0.3)', color: '#fff' }}>
                  <FaLaptopCode size={30} style={{ marginBottom: '0.6rem', opacity: 0.88 }} />
                  <p style={{ fontSize: '0.7rem', fontWeight: 600, margin: '0 0 0.4rem', opacity: 0.78, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active Exams</p>
                  <p style={{ fontWeight: 800, fontSize: '2.4rem', margin: 0, lineHeight: 1 }}>{dashboardStats.activeExams}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ width: '100%', background: darkMode ? 'rgba(15,23,42,0.7)' : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderRadius: '14px', padding: '1.25rem 1.5rem', border: darkMode ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(147,197,253,0.35)' }}>
                <p style={{ margin: '0 0 0.8rem', fontSize: '0.73rem', fontWeight: 700, color: darkMode ? '#7dd3fc' : '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick Actions</p>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {[
                    { label: '📚 Courses',     tab: 'course' },
                    { label: '📋 Exams',        tab: 'exam' },
                    { label: '📝 Evaluations',  tab: 'evaluation' },
                    { label: '📊 Results',      tab: 'result' },
                  ].map(({ label, tab }) => (
                    <button
                      key={tab}
                      onClick={() => { playTick(); setActiveTab(tab); }}
                      style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: darkMode ? '1.5px solid rgba(59,130,246,0.3)' : '1.5px solid rgba(147,197,253,0.5)', background: darkMode ? 'rgba(30,58,138,0.4)' : '#fff', color: darkMode ? '#93c5fd' : '#1e3a8a', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 6px rgba(30,58,138,0.08)', transition: 'box-shadow 0.15s' }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', color: darkMode ? '#e0f2fe' : '#1e3a8a', height: '100%' }}>
              <h2 style={{ ...sectionHeading, marginTop: 0, marginBottom: '2rem', textAlign: 'left' }}>Profile</h2>
              <p style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}><strong>Name:</strong> {user.name}</p>
              <p style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}><strong>Email:</strong> {user.email}</p>
              <p style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>
                <strong>Role:</strong> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </p>
              <div style={{ marginTop: 'auto' }}>
                <button
                  onClick={() => navigate('/change-password')}
                  style={{
                    background: ' #5c5470',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '1rem',
                    padding: '0.85rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(60,60,120,0.12)',
                    transition: 'background 0.2s',
                  }}
                >
                  Change Password
                </button>
              </div>
            </div>
          )}

          {activeTab === 'course' && (
            <div style={{ display: 'flex', flexDirection: 'column', color: '#2d3559', width: '100%', gap: '2rem' }}>
              <h2 style={{ ...sectionHeading, marginTop: 0, marginBottom: 0, textAlign: 'center', color: ' #4b3c70', width: '100%' }}>
                Courses & Enrollment
              </h2>

              {/* Enrolled Courses Section */}
              <EnrolledCoursesSection enrolledCourses={enrolledCourses} />

              {/* Available Courses Cards */}
              <EnrollmentRequestSection
                availableCourses={availableCourses}
                selectedCourse={selectedCourse}
                setSelectedCourse={setSelectedCourse}
                availableBatches={availableBatches}
                selectedBatch={selectedBatch}
                setSelectedBatch={setSelectedBatch}
                handleEnrollmentRequest={handleEnrollmentRequest}
              />
            </div>
          )}
          
          {activeTab === 'exam' && (
            <StudentExamsTab
              sectionHeading={sectionHeading}
              studentBatches={studentBatches}
              selectedBatchForExam={selectedBatchForExam}
              setSelectedBatchForExam={setSelectedBatchForExam}
              batchExams={batchExams}
              fileInputRefs={fileInputRefs}
              handleExamFileChange={handleExamFileChange}
              handleExamFileUpload={handleExamFileUpload}
              examFileMap={examFileMap}
              handleExamHistory={handleExamHistory}
            />
          )}

          {activeTab === 'evaluation' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#2d3559', width: '100%' }}>
              <h2 style={{ ...sectionHeading, marginTop: 0, marginBottom: '2rem', color: '#3f3d56' }}>Evaluations</h2>
              <EvaluationsTable
                evaluations={evaluations}
                evaluationExams={evaluationExams}
                selectedExam={selectedExam}
                setSelectedExam={setSelectedExam}
                isOverlayOpen={isOverlayOpen}
                selectedEvaluation={selectedEvaluation}
                handleEvaluateClick={handleEvaluateClick}
                closeEvalOverlay={closeEvalOverlay}
                handleEvaluationSubmit={handleEvaluationSubmit}
              />
            </div>
          )}

          {activeTab === 'result' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#2d3559', width: '100%' }}>
              <h2 style={{ ...sectionHeading, marginTop: 0, marginBottom: '2rem', color: '#3f3d56' }}>Results</h2>
              <ResultsTable
                resultBatches={resultsBatches}
                selectedResultBatch={selectedResultsBatch}
                setSelectedResultBatch={setSelectedResultsBatch}
                resultExams={resultExams}
                handleViewPeerResults={handleViewPeerResults}
              />
            </div>
          )}

          {activeTab === 'ta' && user.isTA && (
            <TAPanel
              taBatchInfo={taBatchInfo}
              selectedTABatch={selectedTABatch}
              setSelectedTABatch={setSelectedTABatch}
              sectionHeading={sectionHeading}
              handleTAManageClick={handleTAManageClick}
              showTAManageOverlay={showTAManageOverlay}
              closeTAManageOverlay={closeTAManageOverlay}
              manageTAData={manageTAData}
              pendingEnrollments={pendingEnrollments}
              flaggedEvaluations={flaggedEvaluations}
              acceptEnrollment={acceptEnrollment}
              declineEnrollment={declineEnrollment}
              selectedTAExam={selectedTAExam}
              setSelectedTAExam={setSelectedTAExam}
              TAEditEval={TAEditEval}
              TAFlagEval={TAFlagEval}
              TADelEval={TADelEval}
            />
          )}

        </div>
      </main>
      {showTAEvalOverlay && (
        <TAEvalOverlay
          isTAOverlayOpen={showTAEvalOverlay}
          selectedTAEvaluation={selectedTAEvaluation}
          closeTAEvalOverlay={closeTAEvalOverlay}
          handleTAEvaluationUpdate={handleTAEvaluationUpdate}
        />
      )}
      
      <PeerResultOverlay
        isPeerResultOverlayOpen={isPeerResultOverlayOpen}
        closePeerResultOverlay={closePeerResultOverlay}
        selectedExamForPeerResult={selectedExamForPeerResult}
        peerResultsForExam={peerResultsForExam}
        loadingTickets={loadingTickets}
        setLoadingTickets={setLoadingTickets}
        handleRaiseTicket={handleRaiseTicket}
      />

      {examHistoryOverlayOpen && (
        <StudentExamHistoryOverlay
          examHistoryOverlayOpen={examHistoryOverlayOpen}
          examHistoryOverlayClose={() => setExamHistoryOverlayOpen(false)}
          completedExams={completedExams}
        />
      )}
    </div>
  );
}