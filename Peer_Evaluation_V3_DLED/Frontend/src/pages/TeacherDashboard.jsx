import { useState, useEffect } from 'react';
import { data, useNavigate } from 'react-router-dom';
import { FaBook, FaUsers, FaGraduationCap, FaLaptopCode } from 'react-icons/fa';
import '../styles/Teacher/TeacherDashboard.css';
import { containerStyle, sidebarStyle, mainStyle, contentStyle, sidebarToggleBtnStyle, buttonStyle, sectionHeading } from '../styles/Teacher/TeacherDashboard.js';
import { showMessage } from '../utils/Message';
import { AppContext } from '../utils/AppContext';
import { useContext } from 'react';
import ProfileMenu from '../components/User/ProfileMenu.jsx';
import AnnouncementBanner from '../components/AnnouncementBanner';
import ScheduleExamOverlay from '../components/Teacher/ScheduleExamOverlay.jsx';
import EnrollStudentsOverlay from '../components/Teacher/EnrollStudentsOverlay.jsx';
import EditExamOverlay from '../components/Teacher/EditExamOverlay.jsx';
import ExamHistoryOverlay from '../components/Teacher/ExamHistoryOverlay.jsx';
import ExamList from '../components/Teacher/ExamList.jsx';
import { showSendEvaluationDialog, showFlagEvaluationsDialog, showMarkAsDoneDialog, showDeleteExamDialog } from '../components/Teacher/messageDialogs.jsx';
import BulkUploadOverlay from '../components/Teacher/BulkUploadOverlay.jsx';
import FlaggedEvaluationsOverlay from '../components/Teacher/FlaggedEvaluationsOverlay.jsx';
import TeacherEditEvalOverlay from '../components/Teacher/TeacherEditEvalOverlay.jsx';
import ResultsOverlay from '../components/Teacher/ResultsOverlay.jsx';

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState({ name: '', email: '', role: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({courses: 0, batches: 0, enrolledStudents: 0, activeExams: 0});
  const [coursesAndBatches, setCoursesAndBatches] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [examOverlayOpen, setExamOverlayOpen] = useState(false);
  const [enrollOverlayOpen, setEnrollOverlayOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [exams, setExams] = useState([]);
  const [examHistoryOverlayOpen, setExamHistoryOverlayOpen] = useState(false);
  const [completedExams, setCompletedExams] = useState([]);
  const navigate = useNavigate();
  const [isEditExamOverlayOpen, setEditExamOverlayOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [bulkUploadOverlayOpen, setBulkUploadOverlayOpen] = useState(false);
  const [selectedExamForBulkUpload, setSelectedExamForBulkUpload] = useState(null);
  const [flaggedEvaluationsOverlayOpen, setFlaggedEvaluationsOverlayOpen] = useState(false);
  const [flaggedEvaluationsForOverlay, setFlaggedEvaluationsForOverlay] = useState([]);
  const [editEvaluationOverlayOpen, setEditEvaluationOverlayOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [resultsOverlayOpen, setResultsOverlayOpen] = useState(false);
  const [selectedExamForResults, setSelectedExamForResults] = useState(null);
  const { setRefreshApp, darkMode, toggleDarkMode, announcement, announcementDismissed, dismissAnnouncement } = useContext(AppContext);
  const [allAnnouncements, setAllAnnouncements] = useState([]);
  const [newAnnouncementMsg, setNewAnnouncementMsg] = useState('');

  // Course Manager state
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseDetails, setCourseDetails] = useState({ courseId: '', courseName: '', openCourse: false, startDate: '', endDate: '' });
  const [editCourseId, setEditCourseId] = useState('');
  const [editCourseDetails, setEditCourseDetails] = useState({ courseId: '', courseName: '', openCourse: false, startDate: '', endDate: '' });
  const [deleteCourseId, setDeleteCourseId] = useState('');

  // Batch Manager state
  const [allBatches, setAllBatches] = useState([]);
  const [batchDetails, setBatchDetails] = useState({ batchId: '', instructor: '', course: '' });
  const [editBatchId, setEditBatchId] = useState('');
  const [editBatchDetails, setEditBatchDetails] = useState({ batchId: '', instructor: '', course: '' });
  const [deleteBatchId, setDeleteBatchId] = useState('');

  // Pending enrollments
  const [pendingEnrollmentRequests, setPendingEnrollmentRequests] = useState([]);

  const fetchAllAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/announcements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setAllAnnouncements(data);
    } catch (err) { console.error(err); }
  };

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
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/teacher/dashboard-stats', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (response.ok) {
          setDashboardStats({
            courses: data.courses || 0,
            batches: data.batches || 0,
            enrolledStudents: data.enrolledStudents || 0,
            activeExams: data.activeExams || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };

    if (activeTab === 'home') {
      fetchDashboardStats();
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchCoursesAndBatches = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/teacher/teacher-courses-batches', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (Array.isArray(data)) {
          setCoursesAndBatches(data);
        } else {
          console.error('Invalid response format:', data);
          setCoursesAndBatches([]);
        }
      } catch (error) {
        console.error('Failed to fetch courses and batches:', error);
        setCoursesAndBatches([]);
      }
    };

    fetchCoursesAndBatches();
  }, []);

  // Course/Batch Manager fetch functions
  const fetchInstructors = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/teachers', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setInstructors(data);
    } catch (e) { console.error(e); }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/courses', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setCourses(data.map(c => ({ id: c._id || c.id, courseId: c.courseId, name: c.courseName || c.name })));
    } catch (e) { console.error(e); }
  };

  const fetchAllBatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/batches', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setAllBatches(data);
    } catch (e) { console.error(e); }
  };

  const fetchPendingEnrollmentRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/teacher/pending-enrollments', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setPendingEnrollmentRequests(data);
    } catch (e) { console.error(e); }
  };

  const handleEnrollmentAction = async (enrollmentId, action) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/teacher/enrollment/${enrollmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) { showMessage(data.message, 'success'); fetchPendingEnrollmentRequests(); }
      else showMessage(data.message || 'Failed', 'error');
    } catch { showMessage('Failed to update enrollment', 'error'); }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/add-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(courseDetails),
      });
      const data = await res.json();
      if (res.ok) { showMessage(data.message, 'success'); setCourseDetails({ courseId: '', courseName: '', openCourse: false, startDate: '', endDate: '' }); fetchCourses(); }
      else showMessage(data.message || 'Failed to add course', 'error');
    } catch { showMessage('Error adding course', 'error'); }
  };

  const handleEditCourseSelect = async (id) => {
    setEditCourseId(id);
    if (!id) { setEditCourseDetails({ courseId: '', courseName: '', openCourse: false, startDate: '', endDate: '' }); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/course/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const c = await res.json();
        setEditCourseDetails({ courseId: c.courseId, courseName: c.courseName, openCourse: c.openCourse, startDate: c.startDate ? c.startDate.split('T')[0] : '', endDate: c.endDate ? c.endDate.split('T')[0] : '' });
      }
    } catch { showMessage('Error fetching course', 'error'); }
  };

  const handleCourseUpdate = async (e) => {
    e.preventDefault();
    if (!editCourseId) { showMessage('Select a course to edit', 'error'); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/update-course/${editCourseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editCourseDetails),
      });
      const data = await res.json();
      if (res.ok) { showMessage(data.message, 'success'); setEditCourseId(''); handleEditCourseSelect(''); fetchCourses(); }
      else showMessage(data.message || 'Failed to update course', 'error');
    } catch { showMessage('Error updating course', 'error'); }
  };

  const handleCourseDelete = async (e) => {
    e.preventDefault();
    if (!deleteCourseId) { showMessage('Select a course to delete', 'error'); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/delete-course/${deleteCourseId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) { showMessage(data.message, 'success'); setDeleteCourseId(''); fetchCourses(); fetchAllBatches(); }
      else showMessage(data.message || 'Failed to delete course', 'error');
    } catch { showMessage('Error deleting course', 'error'); }
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/add-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(batchDetails),
      });
      const data = await res.json();
      if (res.ok) { showMessage(data.message, 'success'); setBatchDetails({ batchId: '', instructor: '', course: '' }); fetchAllBatches(); }
      else showMessage(data.message || 'Failed to add batch', 'error');
    } catch { showMessage('Error adding batch', 'error'); }
  };

  const handleEditBatchSelect = async (id) => {
    setEditBatchId(id);
    if (!id) { setEditBatchDetails({ batchId: '', instructor: '', course: '' }); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/batch/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const b = await res.json();
        setEditBatchDetails({ batchId: b.batchId, instructor: b.instructor._id, course: b.course._id });
      }
    } catch { showMessage('Error fetching batch', 'error'); }
  };

  const handleBatchUpdate = async (e) => {
    e.preventDefault();
    if (!editBatchId) { showMessage('Select a batch to edit', 'error'); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/update-batch/${editBatchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editBatchDetails),
      });
      const data = await res.json();
      if (res.ok) { showMessage(data.message, 'success'); setEditBatchId(''); handleEditBatchSelect(''); fetchAllBatches(); }
      else showMessage(data.message || 'Failed to update batch', 'error');
    } catch { showMessage('Error updating batch', 'error'); }
  };

  const handleBatchDelete = async () => {
    if (!deleteBatchId) { showMessage('Select a batch to delete', 'error'); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/delete-batch/${deleteBatchId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) { showMessage(data.message, 'success'); setDeleteBatchId(''); fetchAllBatches(); }
      else showMessage(data.message || 'Failed to delete batch', 'error');
    } catch { showMessage('Error deleting batch', 'error'); }
  };

  useEffect(() => {
    if (selectedCourseId) {
      const selectedCourse = coursesAndBatches.find(
        (course) => course.id === selectedCourseId
      );
      const batches = selectedCourse ? selectedCourse.batches : [];
      setFilteredBatches(batches);
      setSelectedBatchId("");
    } else {
      setFilteredBatches([]);
      setSelectedBatchId("");
    }
  }, [selectedCourseId, coursesAndBatches]);

  useEffect(() => {
    if (activeTab === 'exam') {
      const fetchExams = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/api/teacher/teacher-exams', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();

          if (Array.isArray(data.exams)) {
            setExams(data.exams);
          } else {
            console.error('Invalid response format for exams:', data);
            setExams([]);
          }
        } catch (error) {
          console.error('Failed to fetch exams:', error);
          setExams([]);
        }
      };

      fetchExams();
    }
  }, [activeTab]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const refreshExamsList = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/teacher/teacher-exams', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (Array.isArray(data.exams)) {
        setExams(data.exams);
      }
    } catch (error) {
      console.error('Error refreshing exams list:', error);
    }
  };

  const handleSidebarToggle = () => setSidebarOpen(open => !open);

  const handleTAAssignment = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const batchId = e.target.batch.value;
    const action = e.target.action.value;

    if (!email || !batchId || !action) {
      showMessage('Please fill all fields.', 'error');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/${action}-ta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, batchId }),
      });

      const data = await response.json();
      if (response.ok) {
        showMessage(data.message, 'success');
        e.target.reset();
      } else {
        showMessage(data.message || 'Failed to perform action.', 'error');
      }
    } catch (error) {
      showMessage('An error occurred.', 'error');
      console.error(error);
    }
  };

  const handleScheduleExam = () => {
    setExamOverlayOpen(true);
  };

  const handleExamOverlayClose = () => {
    setExamOverlayOpen(false);
  };

  const handleBulkUploadClick = (examId) => {
    setSelectedExamForBulkUpload(examId);
    setBulkUploadOverlayOpen(true);
  };

  const handleBulkUploadOverlayClose = () => {
    setBulkUploadOverlayOpen(false);
    setSelectedExamForBulkUpload(null);
  };

  const handleEnrollStudents = async ({ csvFile, course, batch }) => {
    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('course', course.id);
    formData.append('batch', batch.id);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/teacher/students-enroll', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        showMessage(`Success: ${data.message} with ${data.statistics.enrolled} already enrolled, ${data.statistics.new_enrollment} new enrollments and ${data.statistics.pending_enrollment} pending requests accepted.`, 'success');
      } else if (response.status === 409) {
        const errorData = await response.json();
        showMessage(`Info: ${errorData.message}`, 'info');
      } else {
        const errorData = await response.json();
        showMessage(`Error!  ${errorData.message}`, 'error');
      }
    } catch (error) {
      showMessage('An error occurred while enrolling students.', 'error');
      console.error(error);
    }

    setEnrollOverlayOpen(false);
  };

  const downloadEnrolledStudents = async (courseId, batchId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/teacher/enrolled-students?courseId=${courseId}&batchId=${batchId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students_${batchId}_${courseId}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const errorData = await response.json();
        showMessage(`Error! ${errorData.message}`, 'error');
      }
    } catch (error) {
      showMessage('An error occurred while downloading the student list.', 'error');
      console.error(error);
    }
  };

  const handleExamSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('batch', formData.batch);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('time', formData.time);
      formDataToSend.append('number_of_questions', formData.number_of_questions);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('totalMarks', formData.totalMarks);
      formDataToSend.append('k', formData.k);
      if (formData.solutions) {
        formDataToSend.append('solutions', formData.solutions);
      }
      const response = await fetch('http://localhost:5000/api/teacher/exam-schedule', {
        method: 'POST',
        headers: {
          // 'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const data = await response.json();
        showMessage(data.message, 'success');
      } else {
        const errorData = await response.json();
        showMessage(errorData.message, 'error');
      }
    } catch (error) {
      showMessage('An error occurred while scheduling the exam.', 'error');
      console.error(error);
    }

    setExamOverlayOpen(false);
    setSelectedCourseId('');
    await refreshExamsList();
  };

  const handleEditClick = (exam) => {
    if (!isEditExamOverlayOpen) {
      setSelectedExam(exam);
      setEditExamOverlayOpen(true);
    }
  };

  const handleEditExamOverlayClose = () => {
    setEditExamOverlayOpen(false);
    setSelectedExam(null);
  };

  const handleEditExamOverlaySubmit = async (updatedExam) => {
    try {
      const token = localStorage.getItem('token');
      const editFormDataToSend = new FormData();
      editFormDataToSend.append('name', updatedExam.name);
      editFormDataToSend.append('date', updatedExam.date);
      editFormDataToSend.append('time', updatedExam.time);
      editFormDataToSend.append('number_of_questions', updatedExam.number_of_questions);
      editFormDataToSend.append('duration', updatedExam.duration);
      editFormDataToSend.append('totalMarks', updatedExam.totalMarks);
      editFormDataToSend.append('k', updatedExam.k);
      editFormDataToSend.append('total_students', updatedExam.total_students || 0);
      if (updatedExam.solutions) {
        editFormDataToSend.append('solutions', updatedExam.solutions);
      }
      const response = await fetch(`http://localhost:5000/api/teacher/update-exam/${updatedExam._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: editFormDataToSend,
      });

      if (response.ok) {
        const data = await response.json();
        showMessage('Exam updated successfully!', 'success');
      } else {
        const errorData = await response.json();
        showMessage(`Error! ${errorData.message || 'Failed to update exam.'}`, 'error');
      }
    } catch (error) {
      showMessage('An error occurred while updating the exam.', 'error');
      console.error(error);
    }

    setEditExamOverlayOpen(false);
    setSelectedExam(null);
    await refreshExamsList();
  };

  const handleDownloadPDF = async (examId) => {
    try {
      const token = localStorage.getItem('token'); 

      const response = await fetch(`http://localhost:5000/api/teacher/download-pdf/${examId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });

      if (response.ok) {
        const blob = await response.blob(); // 
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Exam_${examId}_QR_Codes.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const errorText = await response.text(); 
        console.error('Failed to download PDF:', errorText);
        showMessage(`Failed to download PDF: ${errorText}`, 'error');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showMessage(`Error downloading PDF: ${error.message}`, 'error');
    }
  };

  const handleBulkUpload = async (files) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    files.forEach((file) => formData.append('documents', file));
    formData.append('examId', selectedExamForBulkUpload);

    try {
      const response = await fetch('http://localhost:5000/api/teacher/bulk-upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        showMessage(`Bulk upload successful: ${result.message}. Successfully uploaded ${result.added} files and updated ${result.updated} files.`, 'success');
      } else {
        const errorData = await response.json();
        showMessage(`Bulk upload failed: ${errorData.message}`, 'error');
      }
    } catch (error) {
      showMessage(`An error occurred during bulk upload: ${error.message}`, 'error');
    }
    setBulkUploadOverlayOpen(false);
    setSelectedExamForBulkUpload(null);
  };

  const handleSendEvaluation = async (examId) => {
    const confirmSend = await showSendEvaluationDialog();
    if (!confirmSend) return;
    
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/api/teacher/send-evaluation/${examId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`Sending evaluation for exam ID: ${examId}`);
      const data = await response.json();
      if (response.ok) {
        showMessage(data.message, 'success');
        await refreshExamsList();
      } else {
        showMessage(data.message, 'error');
      }
    } catch (error) {
      showMessage('An error occurred while sending the evaluation.', 'error');
    }
  };

  const handleFlagEvaluations = async (examId) => {
    const confirmFlag = await showFlagEvaluationsDialog();
    if (!confirmFlag) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/flag-evaluations/${examId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        showMessage(data.message, 'success');
        await refreshExamsList();
      } else {
        showMessage(data.message, 'error');
      }
    } catch (error) {
      showMessage('An error occurred while flagging evaluations.', 'error');
    }
  };

  const handleMarkAsDone = async (examId) => {
    const confirmMark = await showMarkAsDoneDialog();
    if (!confirmMark) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/mark-exam-done/${examId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setExams(prev => prev.filter(exam => exam._id !== examId));
        showMessage(data.message, 'success');
      } else {
        showMessage(data.message, 'error');
      }
    } catch (err) {
      showMessage('Failed to mark exam as done!', 'error');
    }
  };

  const handleDeleteExam = async (examId) => {
    const confirmDelete = await showDeleteExamDialog();

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/teacher/delete-exam/${examId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showMessage('Exam deleted successfully!', 'success');
        setExams(exams.filter(exam => exam._id !== examId));
      } else {
        const errorData = await response.json();
        showMessage(`Error! ${errorData.message}`, 'error');
      }
    } catch (error) {
      showMessage('An error occurred while deleting the exam.', 'error');
      console.error(error);
    }
  };

  const handleExamHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/teacher/completed-exams', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data.exams)) {
        setCompletedExams(data.exams);
        setExamHistoryOverlayOpen(true);
      } else {
        showMessage('No completed exams found!', 'info');
      }
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const handleViewEvaluations = async (examId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/teacher/flagged-evaluations/${examId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setFlaggedEvaluationsForOverlay(data);
        setFlaggedEvaluationsOverlayOpen(true);
      } else {
        showMessage('No evaluations found!', 'info');
      }
    } catch (error) {
      showMessage('Failed to fetch flagged evaluations.', 'error');
    }
  };

  const handleEditEvaluationOverlayOpen = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setEditEvaluationOverlayOpen(true);
  };

  const handleEditEvaluationOverlayClose = () => {
    setEditEvaluationOverlayOpen(false);
    setSelectedEvaluation(null);
  };

  const handleEvaluationUpdate = async (updateData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/teacher/update-evaluation/${updateData.evaluationId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            score: updateData.score,
            feedback: updateData.feedback,
            ticket: updateData.ticket || 0,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        showMessage(data.message, 'success');
        handleEditEvaluationOverlayClose();
        handleViewEvaluations(updateData.exam);
      } else {
        showMessage(data.message || 'Failed to update evaluation.', 'error');
      }
    } catch (error) {
      showMessage(error.message || 'An error occurred while updating evaluation!', 'error');
    }
  };

  const handleEvaluationFlagRemove = async (evaluation, examId) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/api/teacher/remove-ticket/${evaluation}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        showMessage(data.message, 'success');
        handleViewEvaluations(examId);
      } else {
        showMessage(data.message || 'Failed to remove flag from evaluation.', 'error');
      }
    } catch (error) {
      showMessage('An error occurred while removing flag from evaluation.', 'error');
    }
  };

  const handleViewResults = async (examId) => {
    setSelectedExamForResults(examId);
    setResultsOverlayOpen(true);
  };

  const handleDownloadResults = async (selectedExamForResults) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5000/api/teacher/download-results-csv/${selectedExamForResults}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `exam_${selectedExamForResults}_results.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      });
  };

  const handleDownloadIncentives = async (batchId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/teacher/download-incentives-csv/${batchId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `batch_${batchId}_incentives.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        showMessage(errorData.message, 'error');
      }
    } catch (error) {
      showMessage(error.message || 'Failed to download incentives!', 'error');
    }
  };

  return (
    <div
      className={`teacher-dashboard-bg${sidebarOpen ? ' sidebar-open' : ''}`}
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
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
        scrollbarColor: ' #1d4ed8 transparent',
      }}
    >
      {/* Profile Icon Dropdown Top Right */}
      <div style={{
        position: 'fixed',
        top: 24,
        right: 36,
        zIndex: 1000,
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

      {/* Sidebar Toggle Button */}
      <button
        className="sidebar-toggle-btn"
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          zIndex: 1100,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.3rem',
          alignItems: 'center',
        }}
        onClick={handleSidebarToggle}
        aria-label="Toggle sidebar"
      >
        <span style={{ width: '30px', height: '3px', background: 'white', borderRadius: '2px' }}></span>
        <span style={{ width: '30px', height: '3px', background: 'white', borderRadius: '2px' }}></span>
        <span style={{ width: '30px', height: '3px', background: 'white', borderRadius: '2px' }}></span>
      </button>

      {/* Sidebar (collapsible) */}
      <div
        className={`teacher-dashboard-sidebar${sidebarOpen ? ' open' : ' collapsed'}`}
        style={{
          ...sidebarStyle,
          position: 'relative',
          height: 'auto',
          minHeight: '100vh',
          zIndex: 1,
          width: sidebarOpen ? '250px' : '60px',
          transition: 'width 0.3s ease',
        }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <h2 style={{ fontSize: sidebarOpen ? '1.6rem' : '0', fontWeight: 'bold', marginBottom: sidebarOpen ? '1rem' : '0', overflow: 'hidden', whiteSpace: 'nowrap' }}>Teacher Panel</h2>
        {sidebarOpen && (
          <>
            <button onClick={() => setActiveTab('home')} style={buttonStyle(activeTab === 'home')}>🏠 Home</button>
            <button onClick={() => setActiveTab('role')} style={buttonStyle(activeTab === 'role')}>🧑‍💼 TA Manager</button>
            <button onClick={() => { setActiveTab('course'); fetchCourses(); fetchAllBatches(); fetchPendingEnrollmentRequests(); }} style={buttonStyle(activeTab === 'course')}>📚 Courses</button>
            <button onClick={() => { setActiveTab('courseManager'); fetchCourses(); }} style={buttonStyle(activeTab === 'courseManager')}>🗂️ Course Manager</button>
            <button onClick={() => { setActiveTab('batchManager'); fetchCourses(); fetchAllBatches(); fetchInstructors(); }} style={buttonStyle(activeTab === 'batchManager')}>📘 Batch Manager</button>
            <button onClick={() => setActiveTab('exam')} style={buttonStyle(activeTab === 'exam')}>📝 Exams</button>
            <button onClick={() => { setActiveTab('announcements'); fetchAllAnnouncements(); }} style={buttonStyle(activeTab === 'announcements')}>📢 Announcements</button>
            <button onClick={logout} style={{ marginTop: 'auto', ...buttonStyle(false) }}>🚪 Logout</button>
          </>
        )}
      </div>

      {/* Main Content */}
      <main
        className={`teacher-dashboard-main${sidebarOpen ? ' sidebar-open' : ''}`}
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
        <div className="teacher-dashboard-content" style={{
          ...contentStyle,
          background: 'rgba(255,255,255,0.92)',
          boxShadow: '0 8px 32px rgba(60,60,120,0.18)',
          border: '1.5px solid #e3e6f0',
          maxWidth: 'none',
          width: '100%',
          height: '80vh',
          minHeight: '500px',
          margin: 'auto',
          display: 'block',
          padding: '3rem 4rem',
          minWidth: '1060px',
        }}>
          {activeTab === 'home' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', color: '#1e3a8a' }}>
              <h2 style={{ ...sectionHeading, textAlign: 'center', marginBottom: '3rem' }}>
                Welcome to the Teacher Dashboard
              </h2>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                width: '100%', 
                gap: '1rem',
                flexWrap: 'nowrap',
                alignItems: 'center',
                maxWidth: '100%',
                overflowX: 'hidden'
              }}>
                
                <div 
                  className="dashboard-card"
                  style={{ 
                    textAlign: 'center', 
                    padding: '1.8rem 1.2rem',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
                    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)', 
                    width: 'calc(25% - 0.75rem)',
                    minWidth: '180px',
                    maxWidth: '220px',
                    color: '#fff',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer',
                    flexShrink: 1
                  }}>
                  <FaBook size={45} style={{ marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Total Courses</h3>
                  <p style={{ fontWeight: 'bold', fontSize: '1.8rem', margin: 0 }}>{dashboardStats.courses}</p>
                </div>

                <div 
                  className="dashboard-card"
                  style={{ 
                    textAlign: 'center', 
                    padding: '1.8rem 1.2rem',
                    borderRadius: '16px', 
                    background: 'linear-gradient(135deg, #f093fb, #f5576c)', 
                    boxShadow: '0 8px 20px rgba(240, 147, 251, 0.3)', 
                    width: 'calc(25% - 0.75rem)',
                    minWidth: '180px',
                    maxWidth: '220px',
                    color: '#fff',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer',
                    flexShrink: 1
                  }}>
                  <FaGraduationCap size={45} style={{ marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Total Batches</h3>
                  <p style={{ fontWeight: 'bold', fontSize: '1.8rem', margin: 0 }}>{dashboardStats.batches}</p>
                </div>

                <div 
                  className="dashboard-card"
                  style={{ 
                    textAlign: 'center', 
                    padding: '1.8rem 1.2rem',
                    borderRadius: '16px', 
                    background: 'linear-gradient(135deg, #32cd32, #125e12)',
                    boxShadow: '0 8px 20px rgba(79, 172, 254, 0.3)', 
                    width: 'calc(25% - 0.75rem)',
                    minWidth: '180px',
                    maxWidth: '220px',
                    color: '#fff',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer',
                    flexShrink: 1
                  }}>
                  <FaUsers size={45} style={{ marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Enrolled Students</h3>
                  <p style={{ fontWeight: 'bold', fontSize: '1.8rem', margin: 0 }}>{dashboardStats.enrolledStudents}</p>
                </div>

                <div 
                  className="dashboard-card"
                  style={{ 
                    textAlign: 'center', 
                    padding: '1.8rem 1.2rem',
                    borderRadius: '16px', 
                    background: 'linear-gradient(135deg, #43cea2, #185a9d)', 
                    boxShadow: '0 8px 20px rgba(67, 206, 162, 0.3)', 
                    width: 'calc(25% - 0.75rem)',
                    minWidth: '180px',
                    maxWidth: '220px',
                    color: '#fff',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer',
                    flexShrink: 1
                  }}>
                  <FaLaptopCode size={45} style={{ marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Active Exams</h3>
                  <p style={{ fontWeight: 'bold', fontSize: '1.8rem', margin: 0 }}>{dashboardStats.activeExams}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', color: '#2d3559', height: '100%' }}>
              <h2 style={{ ...sectionHeading, marginTop: 0, marginBottom: '2rem', textAlign: 'left', color: '#1e3a8a' }}>Profile</h2>
              <p style={{ fontSize: '1.2rem', margin: '0.5rem 0', color: '#1e3a8a' }}><strong>Name:</strong> {user.name}</p>
              <p style={{ fontSize: '1.2rem', margin: '0.5rem 0', color: '#1e3a8a' }}><strong>Email:</strong> {user.email}</p>
              <p style={{ fontSize: '1.2rem', margin: '0.5rem 0', color: '#1e3a8a' }}>
                <strong>Role:</strong> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </p>
              <div style={{ marginTop: 'auto' }}>
                <button
                  onClick={() => navigate('/change-password')}
                  style={{
                    background: ' #2563eb',
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

          {activeTab === 'role' && (
            <div style={{ display: 'flex', flexDirection: 'column', color: '#2d3559' }}>
              <h2 style={{ ...sectionHeading, marginTop: 0, marginBottom: '2rem', textAlign: 'center', color: '#1e3a8a' }}>TA Manager</h2>
              <p style={{ textAlign: 'left', color: '#1e3a8a' }}>Assign or deassign a TA to/from a batch by selecting the batch and action.</p>
              <form onSubmit={handleTAAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '50%', maxWidth: '900px', border: '2px solid #2563eb', borderRadius: '12px', padding: '1rem', boxShadow: "0 4px 12px #1d4ed8" }}>
                {/* Email Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                  <label style={{ color: '#1e3a8a', fontWeight: 'bold', whiteSpace: 'nowrap', width: '150px', textAlign: 'left' }} htmlFor="email">Email ID</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter TA email ID"
                    style={{
                      padding: '0.5rem',
                      borderRadius: '12px',
                      border: '1px solid #2563eb',
                      fontSize: '1rem',
                      width: '300px',
                      boxSizing: 'border-box',
                      background: '#ffffff',
                      color: ' #1d4ed8',
                    }}
                  />
                </div>

                {/* Batch Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                  <label style={{ color: '#1e3a8a', fontWeight: 'bold', whiteSpace: 'nowrap', width: '150px', textAlign: 'left' }} htmlFor="batch">Select Batch</label>
                  <select
                    id="batch"
                    name="batch"
                    style={{
                      padding: '0.5rem',
                      borderRadius: '12px',
                      border: '1px solid #2563eb',
                      fontSize: '1rem',
                      width: '300px',
                      boxSizing: 'border-box',
                      background: '#ffffff',
                      color: ' #1d4ed8',
                    }}
                  >
                    <option value="">Select Batch</option>
                    {coursesAndBatches.flatMap(course =>
                      course.batches.map(batch => (
                        <option key={batch.id} value={batch.id}>
                          {course.name} ({batch.name})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Action Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                  <label style={{ color: '#1e3a8a', fontWeight: 'bold', whiteSpace: 'nowrap', width: '150px', textAlign: 'left' }} htmlFor="action">Select Action</label>
                  <select
                    id="action"
                    name="action"
                    style={{
                      padding: '0.5rem',
                      borderRadius: '12px',
                      border: '1px solid #2563eb',
                      fontSize: '1rem',
                      width: '300px',
                      boxSizing: 'border-box',
                      background: '#ffffff',
                      color: ' #1d4ed8',
                    }}
                  >
                    <option value="assign">Assign</option>
                    <option value="deassign">Deassign</option>
                  </select>
                </div>

                {/* Submit Button */}
                <div style={{ display: 'flex', width: '100%', marginLeft: '150px' }}>
                  <button
                    type="submit"
                    style={{
                      background: '#2563eb',
                      border: 'none',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '1rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(60,60,120,0.12)',
                      transition: 'background 0.2s',
                    }}
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'course' && (
            <div style={{ display: 'flex', flexDirection: 'column', color: '#2d3559', width: '100%', gap: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0', color: '#1e3a8a' }}>
                Courses and Batches
              </h2>

              {/* Pending Enrollment Requests */}
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1d4ed8', marginBottom: '0.75rem' }}>
                  Pending Enrollment Requests {pendingEnrollmentRequests.length > 0 && (
                    <span style={{ background: '#c0392b', color: '#fff', borderRadius: '12px', padding: '0.15rem 0.6rem', fontSize: '0.8rem', marginLeft: '0.5rem' }}>{pendingEnrollmentRequests.length}</span>
                  )}
                </h3>
                {pendingEnrollmentRequests.length === 0 ? (
                  <p style={{ color: '#888', fontStyle: 'italic' }}>No pending requests.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #2563eb', borderRadius: '12px', boxShadow: '0 4px 12px #1d4ed8' }}>
                    <thead style={{ backgroundColor: '#1d4ed8', color: '#fff' }}>
                      <tr>
                        <th style={{ padding: '10px 14px', textAlign: 'left' }}>Student</th>
                        <th style={{ padding: '10px 14px', textAlign: 'left' }}>Email</th>
                        <th style={{ padding: '10px 14px', textAlign: 'left' }}>Course</th>
                        <th style={{ padding: '10px 14px', textAlign: 'left' }}>Batch</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingEnrollmentRequests.map(e => (
                        <tr key={e._id} style={{ borderBottom: '1px solid #ddd' }}>
                          <td style={{ padding: '10px 14px', color: '#1e3a8a' }}>{e.student?.name}</td>
                          <td style={{ padding: '10px 14px', color: '#1e3a8a' }}>{e.student?.email}</td>
                          <td style={{ padding: '10px 14px', color: '#1e3a8a' }}>{e.batch?.course?.courseName}</td>
                          <td style={{ padding: '10px 14px', color: '#1e3a8a' }}>{e.batch?.batchId}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button onClick={() => handleEnrollmentAction(e._id, 'approve')}
                                style={{ background: '#27ae60', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.35rem 0.9rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                                Approve
                              </button>
                              <button onClick={() => handleEnrollmentAction(e._id, 'reject')}
                                style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.35rem 0.9rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', overflow: 'hidden', border: '2px solid #2563eb', borderRadius: '12px', boxShadow: "0 4px 12px #1d4ed8" }}>
                <thead style={{ backgroundColor: '#1d4ed8', color: '#ffffff' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Course Name</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Batch Name</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coursesAndBatches.map((course) =>
                    course.batches.map((batch) => (
                      <tr key={batch.id} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '12px', color: '#1e3a8a' }}>{course.name}</td>
                        <td style={{ padding: '12px', color: '#1e3a8a' }}>{batch.name}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => {
                                setSelectedCourse(course);
                                setSelectedBatch(batch);
                                setEnrollOverlayOpen(true);
                              }}
                              style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                backgroundColor: '#1d4ed8',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: '0.95rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                              }}
                            >
                              Enroll Students
                            </button>
                            <button
                              onClick={() => downloadEnrolledStudents(course.id, batch.id)}
                              style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                backgroundColor: '#1d4ed8',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: '0.95rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                              }}
                            >
                              Download List
                            </button>
                            <button
                              style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                backgroundColor: '#1d4ed8',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: '0.95rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                              }}
                              onClick={() => handleDownloadIncentives(batch.id)}
                            >
                              Incentives
                            </button>
                          </div>                          
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'courseManager' && (
            <div style={{ width: '100%', minWidth: '1000px' }}>
              <h2 style={{ ...sectionHeading, marginTop: 0, marginBottom: '2rem', textAlign: 'center', color: '#1e3a8a' }}>Course Manager</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>

                {/* Add Course */}
                <div style={{ width: '40%', border: '2px solid #2563eb', borderRadius: '15px', boxShadow: '0 4px 12px #1d4ed8' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', color: '#1e3a8a' }}>Add New Course</h3>
                  <form onSubmit={handleCourseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '0.5rem' }}>
                    {[['courseId', 'Course ID', 'text'], ['courseName', 'Course Name', 'text'], ['startDate', 'Start Date', 'date'], ['endDate', 'End Date', 'date']].map(([field, label, type]) => (
                      <div key={field} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <label style={{ color: '#1e3a8a', fontWeight: 'bold', width: '35%', whiteSpace: 'nowrap' }}>{label}</label>
                        <input type={type} value={courseDetails[field] || ''} onChange={e => setCourseDetails({ ...courseDetails, [field]: e.target.value })}
                          style={{ padding: '0.5rem', borderRadius: '12px', border: '1px solid #2563eb', fontSize: '1rem', width: '60%', background: '#fff', color: '#1d4ed8', colorScheme: 'light' }} />
                      </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <label style={{ color: '#1e3a8a', fontWeight: 'bold', width: '35%' }}>Open Course</label>
                      <input type="checkbox" checked={courseDetails.openCourse || false} onChange={e => setCourseDetails({ ...courseDetails, openCourse: e.target.checked })}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                      <button type="submit" style={{ background: '#2563eb', border: 'none', color: '#fff', fontWeight: 600, fontSize: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>Add Course</button>
                    </div>
                  </form>
                </div>

                {/* Edit Course */}
                <div style={{ width: '35%', marginLeft: '2rem', marginRight: '2rem', border: '2px solid #2563eb', borderRadius: '15px', boxShadow: '0 4px 12px #1d4ed8' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', color: '#1e3a8a' }}>Edit Course</h3>
                  <div style={{ margin: '0.5rem 1rem 1rem' }}>
                    <label style={{ color: '#1e3a8a', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Select Course to Edit</label>
                    <select value={editCourseId} onChange={e => handleEditCourseSelect(e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '12px', border: '1px solid #2563eb', fontSize: '1rem', width: '90%', background: '#fff', color: '#1d4ed8' }}>
                      <option value="">Select Course</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.courseId} - {c.name}</option>)}
                    </select>
                  </div>
                  {editCourseId && (
                    <form onSubmit={handleCourseUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '0.5rem' }}>
                      {[['courseId', 'Course ID', 'text'], ['courseName', 'Course Name', 'text'], ['startDate', 'Start Date', 'date'], ['endDate', 'End Date', 'date']].map(([field, label, type]) => (
                        <div key={field} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <label style={{ color: '#1e3a8a', fontWeight: 'bold', width: '35%', whiteSpace: 'nowrap' }}>{label}</label>
                          <input type={type} value={editCourseDetails[field] || ''} onChange={e => setEditCourseDetails({ ...editCourseDetails, [field]: e.target.value })}
                            style={{ padding: '0.5rem', borderRadius: '12px', border: '1px solid #2563eb', fontSize: '1rem', width: '60%', background: '#fff', color: '#1d4ed8', colorScheme: 'light' }} />
                        </div>
                      ))}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <label style={{ color: '#1e3a8a', fontWeight: 'bold', width: '35%' }}>Open Course</label>
                        <input type="checkbox" checked={editCourseDetails.openCourse || false} onChange={e => setEditCourseDetails({ ...editCourseDetails, openCourse: e.target.checked })}
                          style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                        <button type="submit" style={{ background: '#2563eb', border: 'none', color: '#fff', fontWeight: 600, fontSize: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>Update Course</button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Delete Course */}
                <div style={{ width: '25%', border: '2px solid #2563eb', borderRadius: '15px', boxShadow: '0 4px 12px #1d4ed8' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', color: '#1e3a8a' }}>Delete Course</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', margin: '0.5rem' }}>
                    <select value={deleteCourseId} onChange={e => setDeleteCourseId(e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '12px', border: '1px solid #2563eb', fontSize: '1rem', width: '90%', background: '#fff', color: '#1d4ed8' }}>
                      <option value="">Select Course</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.courseId} - {c.name}</option>)}
                    </select>
                    <button onClick={handleCourseDelete}
                      style={{ background: '#c0392b', border: 'none', color: '#fff', fontWeight: 600, fontSize: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', width: '60%' }}>
                      Delete Course
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'batchManager' && (
            <div style={{ width: '100%', minWidth: '1000px' }}>
              <h2 style={{ ...sectionHeading, marginTop: 0, marginBottom: '2rem', textAlign: 'center', color: '#1e3a8a' }}>Batch Manager</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>

                {/* Add Batch */}
                <div style={{ width: '35%', border: '2px solid #2563eb', borderRadius: '15px', boxShadow: '0 4px 12px #1d4ed8' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', color: '#1e3a8a' }}>Add New Batch</h3>
                  <form onSubmit={handleBatchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '90%' }}>
                      <label style={{ color: '#1e3a8a', fontWeight: 'bold', width: '40%', whiteSpace: 'nowrap' }}>Batch ID</label>
                      <input type="text" value={batchDetails.batchId} onChange={e => setBatchDetails({ ...batchDetails, batchId: e.target.value })}
                        placeholder="Enter batch ID"
                        style={{ padding: '0.5rem', borderRadius: '12px', border: '1px solid #2563eb', fontSize: '1rem', width: '100%', background: '#fff', color: '#1d4ed8' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '90%' }}>
                      <label style={{ color: '#1e3a8a', fontWeight: 'bold', width: '40%', whiteSpace: 'nowrap' }}>Instructor</label>
                      <select value={batchDetails.instructor} onChange={e => setBatchDetails({ ...batchDetails, instructor: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: '12px', border: '1px solid #2563eb', fontSize: '1rem', width: '100%', background: '#fff', color: '#1d4ed8' }}>
                        <option value="">Select Instructor</option>
                        {instructors.map(i => <option key={i._id} value={i._id}>{i.name} ({i.email})</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '90%' }}>
                      <label style={{ color: '#1e3a8a', fontWeight: 'bold', width: '40%', whiteSpace: 'nowrap' }}>Course</label>
                      <select value={batchDetails.course} onChange={e => setBatchDetails({ ...batchDetails, course: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: '12px', border: '1px solid #2563eb', fontSize: '1rem', width: '100%', background: '#fff', color: '#1d4ed8' }}>
                        <option value="">Select Course</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.courseId} - {c.name}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                      <button type="submit" style={{ background: '#2563eb', border: 'none', color: '#fff', fontWeight: 600, fontSize: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>Add Batch</button>
                    </div>
                  </form>
                </div>

                {/* Edit Batch */}
                <div style={{ width: '35%', marginLeft: '2rem', marginRight: '2rem', border: '2px solid #2563eb', borderRadius: '15px', boxShadow: '0 4px 12px #1d4ed8' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', color: '#1e3a8a' }}>Edit Batch</h3>
                  <div style={{ margin: '0.5rem 1rem 1rem' }}>
                    <label style={{ color: '#1e3a8a', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Select Batch to Edit</label>
                    <select value={editBatchId} onChange={e => handleEditBatchSelect(e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '12px', border: '1px solid #2563eb', fontSize: '1rem', width: '90%', background: '#fff', color: '#1d4ed8' }}>
                      <option value="">Select Batch</option>
                      {allBatches.map(b => <option key={b._id} value={b._id}>{b.batchId} - {b.course?.courseName} ({b.instructor?.name})</option>)}
                    </select>
                  </div>
                  {editBatchId && (
                    <form onSubmit={handleBatchUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <label style={{ color: '#1e3a8a', fontWeight: 'bold', width: '30%', whiteSpace: 'nowrap' }}>Batch ID</label>
                        <input type="text" value={editBatchDetails.batchId} onChange={e => setEditBatchDetails({ ...editBatchDetails, batchId: e.target.value })}
                          style={{ padding: '0.5rem', borderRadius: '12px', border: '1px solid #2563eb', fontSize: '1rem', width: '60%', background: '#fff', color: '#1d4ed8' }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <label style={{ color: '#1e3a8a', fontWeight: 'bold', width: '30%', whiteSpace: 'nowrap' }}>Instructor</label>
                        <select value={editBatchDetails.instructor} onChange={e => setEditBatchDetails({ ...editBatchDetails, instructor: e.target.value })}
                          style={{ padding: '0.5rem', borderRadius: '12px', border: '1px solid #2563eb', fontSize: '1rem', width: '60%', background: '#fff', color: '#1d4ed8' }}>
                          <option value="">Select Instructor</option>
                          {instructors.map(i => <option key={i._id} value={i._id}>{i.name} ({i.email})</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <label style={{ color: '#1e3a8a', fontWeight: 'bold', width: '30%', whiteSpace: 'nowrap' }}>Course</label>
                        <select value={editBatchDetails.course} onChange={e => setEditBatchDetails({ ...editBatchDetails, course: e.target.value })}
                          style={{ padding: '0.5rem', borderRadius: '12px', border: '1px solid #2563eb', fontSize: '1rem', width: '60%', background: '#fff', color: '#1d4ed8' }}>
                          <option value="">Select Course</option>
                          {courses.map(c => <option key={c.id} value={c.id}>{c.courseId} - {c.name}</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                        <button type="submit" style={{ background: '#2563eb', border: 'none', color: '#fff', fontWeight: 600, fontSize: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>Update Batch</button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Delete Batch */}
                <div style={{ width: '25%', border: '2px solid #2563eb', borderRadius: '15px', boxShadow: '0 4px 12px #1d4ed8' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', color: '#1e3a8a' }}>Delete Batch</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', margin: '0.5rem' }}>
                    <select value={deleteBatchId} onChange={e => setDeleteBatchId(e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '12px', border: '1px solid #2563eb', fontSize: '1rem', width: '90%', background: '#fff', color: '#1d4ed8' }}>
                      <option value="">Select Batch</option>
                      {allBatches.map(b => <option key={b._id} value={b._id}>{b.batchId} - {b.course?.courseName} ({b.instructor?.name})</option>)}
                    </select>
                    <button onClick={handleBatchDelete}
                      style={{ background: '#c0392b', border: 'none', color: '#fff', fontWeight: 600, fontSize: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', width: '55%' }}>
                      Delete Batch
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'exam' && (
            <div style={{ display: 'flex', flexDirection: 'column', color: '#2d3559', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: '2rem' }}>
                <h2 style={{ ...sectionHeading, marginBottom: '2rem', textAlign: 'center', color: '#1e3a8a', flex: 1 }}>
                  Exam Management
                </h2>
                <button
                  onClick={handleExamHistory}
                  style={{
                    position: 'absolute',
                    right: 0,
                    background: '#1d4ed8',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.6rem 1.2rem',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(60,60,120,0.12)',
                  }}
                >
                  Exam History
                </button>
              </div>

              {/* Inline Row for Course, Batch Dropdowns, and Schedule Exam Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', width: '97%', border: '2px solid #2563eb', borderRadius: '12px', padding: '1rem', boxShadow: "0 4px 12px #1d4ed8" }}>
                {/* Course Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 auto' }}>
                  <label style={{ color: '#1e3a8a', fontWeight: 'bold', whiteSpace: 'nowrap' }} htmlFor="courseDropdown">Course</label>
                  <select
                    id="courseDropdown"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '12px',
                      border: '1px solid #2563eb',
                      fontSize: '1rem',
                      width: '250px',
                      background: '#ffffff',
                      color: '#1d4ed8',
                    }}
                  >
                    <option value="">Select Course</option>
                    {coursesAndBatches.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>

                {/* Batch Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 auto' }}>
                  <label style={{ color: '#1e3a8a', fontWeight: 'bold', whiteSpace: 'nowrap' }} htmlFor="batchDropdown">Batch</label>
                  <select
                    id="batchDropdown"
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    disabled={filteredBatches.length === 0}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '12px',
                      border: '1px solid #2563eb',
                      fontSize: '1rem',
                      width: '250px',
                      background: filteredBatches.length > 0 ? '#ffffff' : '#f0f0f0',
                      color: filteredBatches.length > 0 ? '#1d4ed8' : '#a0a0a0',
                    }}
                  >
                    <option value="">{filteredBatches.length > 0 ? 'Select Batch' : 'No Batches Available'}</option>
                    {filteredBatches.map(batch => (
                      <option key={batch.id} value={batch.id}>{batch.name}</option>
                    ))}
                  </select>
                </div>

                {/* Schedule Exam Button */}
                <button
                  onClick={handleScheduleExam}
                  disabled={!selectedCourseId || !selectedBatchId}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: '12px',
                    backgroundColor: selectedCourseId && selectedBatchId ? '#1d4ed8' : '#a0a0a0',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: selectedCourseId && selectedBatchId ? 'pointer' : 'not-allowed',
                  }}
                >
                  Schedule Exam
                </button>
              </div>

              {/* List of Exams */}
              <ExamList 
                exams={exams} 
                handleEditClick={handleEditClick} 
                handleDownloadPDF={handleDownloadPDF} 
                handleBulkUploadClick={handleBulkUploadClick} 
                handleSendEvaluation={handleSendEvaluation}
                handleFlagEvaluations={handleFlagEvaluations}
                handleMarkAsDone={handleMarkAsDone}
                handleDeleteExam={handleDeleteExam}
                handleViewEvaluations={handleViewEvaluations}
                handleViewResults={handleViewResults}
              />
            </div>
          )}

          {activeTab === 'announcements' && (
            <div style={{ display: 'flex', flexDirection: 'column', color: '#1e3a8a', gap: '1.5rem' }}>
              <h2 style={{ ...sectionHeading, marginTop: 0, marginBottom: '1rem' }}>Announcements</h2>

              {/* Post new announcement */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <textarea
                  value={newAnnouncementMsg}
                  onChange={e => setNewAnnouncementMsg(e.target.value)}
                  placeholder="Type an announcement..."
                  rows={3}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: 8, border: '1.5px solid #2563eb', fontSize: '1rem', resize: 'vertical', fontFamily: 'inherit' }}
                />
                <button
                  onClick={async () => {
                    if (!newAnnouncementMsg.trim()) return;
                    try {
                      const token = localStorage.getItem('token');
                      const res = await fetch('http://localhost:5000/api/announcements', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ message: newAnnouncementMsg }),
                      });
                      if (res.ok) { setNewAnnouncementMsg(''); fetchAllAnnouncements(); showMessage('Announcement posted!', 'success'); }
                      else showMessage('Failed to post announcement', 'error');
                    } catch { showMessage('Failed to post announcement', 'error'); }
                  }}
                  style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Post
                </button>
              </div>

              {/* Existing announcements */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '55vh' }}>
                {allAnnouncements.length === 0 && <p style={{ color: '#888' }}>No announcements yet.</p>}
                {allAnnouncements.map(a => (
                  <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', border: '1.5px solid #e3e6f0', borderRadius: 8, background: a.active ? '#f5f3ff' : '#f9f9f9' }}>
                    <span style={{ flex: 1, color: a.active ? '#1e3a8a' : '#aaa', textDecoration: a.active ? 'none' : 'line-through' }}>{a.message}</span>
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          await fetch(`http://localhost:5000/api/announcements/${a._id}`, {
                            method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ active: !a.active }),
                          });
                          fetchAllAnnouncements();
                        } catch { showMessage('Failed to update', 'error'); }
                      }}
                      style={{ background: a.active ? '#e0e0e0' : '#1d4ed8', color: a.active ? '#333' : '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      {a.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          await fetch(`http://localhost:5000/api/announcements/${a._id}`, {
                            method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
                          });
                          fetchAllAnnouncements();
                        } catch { showMessage('Failed to delete', 'error'); }
                      }}
                      style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Schedule Exam Overlay */}
      <ScheduleExamOverlay
        isOpen={examOverlayOpen}
        onClose={handleExamOverlayClose}
        onSubmit={handleExamSubmit}
        batch={selectedBatchId}
      />

      {/* Enroll Students Overlay */}
      <EnrollStudentsOverlay
        isOpen={enrollOverlayOpen}
        onClose={() => setEnrollOverlayOpen(false)}
        onSubmit={handleEnrollStudents}
        course={selectedCourse}
        batch={selectedBatch}
        closeOnOutsideClick={true}
      />

      {/* EditExamOverlay */}
      {isEditExamOverlayOpen && selectedExam && (
        <EditExamOverlay
          isOpen={isEditExamOverlayOpen}
          exam={selectedExam}
          onClose={handleEditExamOverlayClose}
          onSubmit={handleEditExamOverlaySubmit}
        />
      )}

      {examHistoryOverlayOpen && (
        <ExamHistoryOverlay
          examHistoryOverlayOpen={examHistoryOverlayOpen}
          examHistoryOverlayClose={() => setExamHistoryOverlayOpen(false)}
          completedExams={completedExams}
          handleDownloadResults={handleDownloadResults}
        />
      )}

      {bulkUploadOverlayOpen && (
        <BulkUploadOverlay
          examId={selectedExamForBulkUpload} 
          onClose={handleBulkUploadOverlayClose} 
          onUpload={handleBulkUpload} 
        />
      )}

      {flaggedEvaluationsOverlayOpen && (
        <FlaggedEvaluationsOverlay
          flaggedEvaluationsOverlayOpen={flaggedEvaluationsOverlayOpen}
          flaggedEvaluationsOverlayClose={() => setFlaggedEvaluationsOverlayOpen(false)}
          flaggedEvaluations={flaggedEvaluationsForOverlay}
          handleEditEvaluationOverlayOpen={handleEditEvaluationOverlayOpen}
          handleEvaluationFlagRemove={handleEvaluationFlagRemove}
        />
      )}

      {editEvaluationOverlayOpen && selectedEvaluation && (
        <TeacherEditEvalOverlay
          isEditOverlayOpen={editEvaluationOverlayOpen}
          selectedEvaluation={selectedEvaluation}
          closeEditOverlay={handleEditEvaluationOverlayClose}
          handleEvaluationUpdate={handleEvaluationUpdate}
        />
      )}

      {resultsOverlayOpen && selectedExamForResults && (
        <ResultsOverlay
          resultsOverlayOpen={resultsOverlayOpen}
          selectedExamForResults={selectedExamForResults}
          resultsOverlayClose={() => setResultsOverlayOpen(false)}
          handleDownloadResults={handleDownloadResults}
        />
      )}

    </div>
  );
}
