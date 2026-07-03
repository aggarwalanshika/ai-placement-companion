import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  Upload,
  FileText,
  AlertTriangle,
  ArrowRight,
  Loader,
  Cpu,
  FileSearch,
  Check,
  Download,
  MessageSquare,
  Video,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

const easeCurve = [0.16, 1, 0.3, 1] as const;

interface SectionScores {
  experience: number;
  projects: number;
  skills: number;
  education: number;
  grammar: number;
  formatting: number;
}

interface StrengthOrWeakness {
  title: string;
  desc: string;
}

interface KeywordComparison {
  name: string;
  type: 'matched' | 'missing';
}

interface ProjectAnalysisItem {
  name: string;
  review: string;
  suggestions: string[];
  improved: string;
}

interface ResumeAnalysisResult {
  overallScore: number;
  sectionScores: SectionScores;
  strengths: StrengthOrWeakness[];
  weaknesses: StrengthOrWeakness[];
  missingSkills: string[];
  suggestions: string[];
  keywordMatch: KeywordComparison[];
  resumeSummary: string;
  projectAnalysis: ProjectAnalysisItem[];
}

export default function ResumeAnalyzer() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [reportReady, setReportReady] = useState(false);

  // Dynamic analysis result state
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    'Reading Resume PDF structure...',
    'Extracting projects, skills, and education details...',
    'Detecting years of experience & role profiles...',
    'Matching keyword density against job targets...',
    'Comparing layout against ATS industry guidelines...',
    'Generating AI SDE suggestions & improved descriptions...',
    'Assembling final resume intelligence scorecard...',
  ];

  // Loader checkpoints timer
  useEffect(() => {
    if (analyzing) {
      const stepDuration = 600;
      const interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) {
            setCompletedSteps((prevCompleted) => [...prevCompleted, prev]);
            return prev + 1;
          } else {
            clearInterval(interval);
            setTimeout(() => {
              setAnalyzing(false);
              setReportReady(true);
            }, 500);
            return prev;
          }
        });
      }, stepDuration);
      return () => clearInterval(interval);
    }
  }, [analyzing, steps.length]);

  // Score counter animation
  useEffect(() => {
    if (reportReady && analysisResult) {
      let currentVal = 0;
      const targetVal = analysisResult.overallScore;
      if (targetVal <= 0) {
        setAnimatedScore(0);
        return;
      }
      const stepTime = Math.abs(Math.floor(800 / targetVal));
      const timer = setInterval(() => {
        currentVal += 1;
        setAnimatedScore(currentVal);
        if (currentVal >= targetVal) {
          clearInterval(timer);
        }
      }, stepTime);
      return () => clearInterval(timer);
    } else {
      setAnimatedScore(0);
    }
  }, [reportReady, analysisResult]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndProcessFile = async (selectedFile: File) => {
    setErrorMessage(null);
    setReportReady(false);
    setAnalysisResult(null);

    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.pdf') && !selectedFile.name.endsWith('.docx')) {
      setUploadState('error');
      setErrorMessage('Unsupported file format. Please upload PDF or DOCX files.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadState('error');
      setErrorMessage('File size exceeds the 5MB maximum limit.');
      return;
    }

    setFile(selectedFile);
    setUploadState('uploading');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      console.log('Uploading resume to backend...'); // Step 1 Console Log

      const response = await axios.post('/api/resume/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || selectedFile.size;
          const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
          setUploadProgress(percentCompleted);
        },
      });

      console.log('Complete JSON response:', response.data); // Step 1 Console Log

      if (response.data && response.data.success && response.data.data) {
        setUploadState('success');
        setAnalysisResult(response.data.data);
        setTimeout(() => {
          setAnalyzing(true);
          setCurrentStepIndex(0);
          setCompletedSteps([]);
        }, 800);
      } else {
        throw new Error('API returned malformed output.');
      }
    } catch (err: any) {
      console.error('File analysis error:', err);
      const msg = err.response?.data?.message || err.message || 'Connection failed.';
      setUploadState('error');
      setErrorMessage(msg);
    }
  };

  const handleSimulatedUpload = async () => {
    setErrorMessage(null);
    setReportReady(false);
    setAnalysisResult(null);
    setUploadState('uploading');
    setUploadProgress(0);

    // Create a client-side simulated valid mock PDF byte stream
    const mockBlob = new Blob([
      '%PDF-1.4\n%쏢\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [ 3 0 R ] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << >> /MediaBox [ 0 0 612 792 ] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 50 >>\nstream\nBT /F1 12 Tf 72 712 Td (John Doe SDE Resume. Experience: Node.js, TypeScript, React, PostgreSQL.) Tj ET\nendstream\nendobj\nxref\n0 5\ntrailer\n<< /Size 5 /Root 1 0 R >>\n%%EOF'
    ], { type: 'application/pdf' });
    const mockFile = new File([mockBlob], 'Software_Engineer_Resume_Mock.pdf', { type: 'application/pdf' });

    setFile(mockFile);

    const formData = new FormData();
    formData.append('resume', mockFile);

    try {
      console.log('Uploading resume to backend...'); // Step 1 Console Log

      const response = await axios.post('/api/resume/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || mockFile.size;
          const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
          setUploadProgress(percentCompleted);
        },
      });

      console.log('Complete JSON response:', response.data); // Step 1 Console Log

      if (response.data && response.data.success && response.data.data) {
        setUploadState('success');
        setAnalysisResult(response.data.data);
        setTimeout(() => {
          setAnalyzing(true);
          setCurrentStepIndex(0);
          setCompletedSteps([]);
        }, 800);
      } else {
        throw new Error('API returned malformed output.');
      }
    } catch (err: any) {
      console.error('Simulated upload error:', err);
      const msg = err.response?.data?.message || err.message || 'Connection failed.';
      setUploadState('error');
      setErrorMessage(msg);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const resetAnalyzer = () => {
    setFile(null);
    setUploadState('idle');
    setUploadProgress(0);
    setReportReady(false);
    setAnalyzing(false);
    setErrorMessage(null);
    setAnalysisResult(null);
  };

  // Build Recharts Radar data from dynamic response object
  const getChartData = () => {
    if (!analysisResult) return [];
    return [
      { subject: 'Experience', score: analysisResult.sectionScores.experience },
      { subject: 'Projects', score: analysisResult.sectionScores.projects },
      { subject: 'Skills', score: analysisResult.sectionScores.skills },
      { subject: 'Education', score: analysisResult.sectionScores.education },
      { subject: 'Grammar', score: analysisResult.sectionScores.grammar },
      { subject: 'Formatting', score: analysisResult.sectionScores.formatting },
    ];
  };

  // Build section scores bar data from dynamic response object
  const getSectionScores = () => {
    if (!analysisResult) return [];
    return [
      { name: 'Experience Score', score: analysisResult.sectionScores.experience, color: 'bg-emerald-500', text: 'text-emerald-400' },
      { name: 'Projects Score', score: analysisResult.sectionScores.projects, color: 'bg-green-500', text: 'text-green-400' },
      { name: 'Skills Score', score: analysisResult.sectionScores.skills, color: 'bg-yellow-500', text: 'text-yellow-400' },
      { name: 'Education Score', score: analysisResult.sectionScores.education, color: 'bg-blue-500', text: 'text-blue-400' },
      { name: 'Grammar Score', score: analysisResult.sectionScores.grammar, color: 'bg-indigo-500', text: 'text-indigo-400' },
      { name: 'Formatting Score', score: analysisResult.sectionScores.formatting, color: 'bg-purple-500', text: 'text-purple-400' },
    ];
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            <FileSearch className="w-5 h-5 text-blue-400" /> ATS Resume Scanner
          </h1>
          <p className="text-slate-550 text-xs">Verify your ATS score and get SDE-focused keyword recommendations in seconds.</p>
        </div>
        {reportReady && (
          <button
            onClick={resetAnalyzer}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold rounded-lg text-slate-300 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Upload New Resume
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!analyzing && !reportReady && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: easeCurve }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-6"
          >
            {/* Left Col: Upload Zone */}
            <div className="lg:col-span-3 space-y-6">
              {uploadState !== 'success' ? (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`p-12 border-2 border-dashed rounded-2xl text-center flex flex-col items-center justify-center space-y-6 transition-all ${
                    dragActive
                      ? 'border-blue-500 bg-blue-950/10'
                      : 'border-slate-800 bg-slate-900/10 hover:border-slate-700/80 hover:bg-slate-900/20'
                  }`}
                >
                  <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl text-slate-400">
                    <Upload className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">Drag and drop your resume file here</h3>
                    <p className="text-[11px] text-slate-500">Supports PDF or DOCX formats up to 5MB.</p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileChange}
                  />

                  <button
                    onClick={triggerFilePicker}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-lg text-white shadow-lg shadow-blue-500/15 transition-all"
                  >
                    Choose File from Local Storage
                  </button>

                  {/* Progress Slider Mockup */}
                  {uploadState === 'uploading' && (
                    <div className="w-full max-w-xs space-y-2 pt-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-450 font-semibold flex items-center gap-1">
                          <Loader className="animate-spin w-3 h-3 text-blue-500" /> Uploading file...
                        </span>
                        <span className="text-slate-450 font-mono">{uploadProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Alert */}
                  {uploadState === 'error' && errorMessage && (
                    <div className="w-full max-w-sm rounded-xl bg-red-950/40 border border-red-900/60 p-4 flex gap-3 text-xs text-red-300 text-left">
                      <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 border border-slate-800 bg-slate-900/10 rounded-2xl text-center flex flex-col items-center justify-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-green-950/60 border border-green-800 flex items-center justify-center">
                    <Check className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">File Uploaded Successfully!</span>
                    <span className="text-[10px] text-green-400 font-semibold block mt-1">
                      {file?.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Upload Tester Banner */}
              <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-400">Want to test the AI report instantly without uploading a file?</span>
                <button
                  onClick={handleSimulatedUpload}
                  className="text-blue-500 font-semibold hover:underline flex items-center gap-0.5"
                >
                  Run simulated analysis <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Col: Recent Uploads & Previous Analyses */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-400" /> Recent Uploads
                </h3>
                <div className="space-y-3 text-xs">
                  {[
                    { name: 'Software_Engineer_Resume_John.pdf', score: 87, date: 'Just now' },
                    { name: 'Software_Engineer_Resume_V2.pdf', score: 82, date: '1 day ago' },
                    { name: 'Software_Engineer_Resume_V1.pdf', score: 74, date: '4 days ago' }
                  ].map((hist, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg">
                      <span className="text-slate-400 flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                        <FileText className="w-3.5 h-3.5 text-blue-400" /> {hist.name}
                      </span>
                      <span className="font-semibold text-green-400 font-mono bg-green-950/40 px-2 py-0.5 rounded border border-green-900/60">{hist.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Full-screen AI Loading Sequence */}
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#070a13] flex flex-col items-center justify-center p-6 select-none"
          >
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md space-y-8 relative z-10">
              <div className="text-center space-y-2">
                <Cpu className="mx-auto h-10 w-10 text-blue-500 animate-pulse" />
                <h3 className="text-base font-bold text-white tracking-wide uppercase">AI Placement Intelligence Core</h3>
                <p className="text-xs text-slate-500">Formulating SDE profile metrics matching job target specifications.</p>
              </div>

              {/* Progress workflow lines */}
              <div className="space-y-4">
                {steps.map((step, idx) => {
                  const isCompleted = completedSteps.includes(idx);
                  const isActive = idx === currentStepIndex;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{
                        opacity: isCompleted || isActive ? 1 : 0.25,
                        x: 0,
                      }}
                      transition={{ duration: 0.4 }}
                      className="flex items-center gap-3 text-xs"
                    >
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <div className="h-5 w-5 rounded-full bg-green-950/60 border border-green-800 flex items-center justify-center">
                            <Check className="h-3 w-3 text-green-400" />
                          </div>
                        ) : isActive ? (
                          <Loader className="animate-spin h-5 w-5 text-blue-500" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-slate-900 bg-slate-950" />
                        )}
                      </div>
                      <span className={`font-medium ${isActive ? 'text-white font-semibold' : 'text-slate-400'}`}>
                        {step}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Complete ATS Report */}
        {reportReady && analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeCurve }}
            className="space-y-6"
          >
            {/* Top Score Banner layout */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Radar Chart */}
              <div className="md:col-span-2 p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">ATS Breakdown</h3>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Section mapping score distribution</span>
                </div>

                <div className="h-52 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getChartData()}>
                      <PolarGrid stroke="#1e293b" />
                      <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={9} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" fontSize={8} />
                      <Radar name="Candidate" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dials & Overall Score details */}
              <div className="md:col-span-3 p-6 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl flex flex-col justify-between">
                
                {/* Gauge Row */}
                <div className="flex gap-6 items-center">
                  {/* Score circle */}
                  <div className="relative h-24 w-24 flex items-center justify-center bg-slate-950 border border-slate-900 rounded-full shadow-lg">
                    <span className="text-2xl font-extrabold text-green-400 font-mono">{animatedScore}</span>
                    <span className="text-[10px] text-slate-500 absolute bottom-4">/ 100</span>
                    <div className="absolute inset-2 rounded-full border-2 border-green-500/10 border-t-green-400" />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-white">ATS SDE Compatibility</h2>
                    <span className="text-xs font-semibold text-green-400 bg-green-950/40 px-2 py-0.5 rounded border border-green-900/60 uppercase tracking-wide inline-block mt-1">
                      Ready for Review
                    </span>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                      {analysisResult.resumeSummary || 'Resume summary parsed successfully by generative SDE filters.'}
                    </p>
                  </div>
                </div>

                {/* Subsections Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-slate-900/60 mt-6">
                  {getSectionScores().map((sec, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-455 font-semibold">{sec.name}</span>
                        <span className={`font-bold ${sec.text}`}>{sec.score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                        <div
                          className={`h-full ${sec.color} rounded-full`}
                          style={{ width: `${sec.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Keyword Comparisons & Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Matched vs Missing Keywords */}
              <div className="lg:col-span-2 p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Keywords Comparison</h3>
                
                <div className="space-y-2">
                  {(analysisResult.keywordMatch || []).map((kw, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/40 border border-slate-900 rounded-lg text-xs">
                      <span className="font-semibold text-white">{kw.name}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        kw.type === 'matched' ? 'bg-green-950/40 border border-green-900/40 text-green-400' : 'bg-red-950/40 border border-red-900/40 text-red-400'
                      }`}>
                        {kw.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Recommendations List */}
              <div className="lg:col-span-3 p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-yellow-400" /> SDE Action Recommendations
                </h3>
                
                <ul className="space-y-3.5 text-xs text-slate-400 leading-relaxed pl-4 list-disc list-inside">
                  {(analysisResult.suggestions || []).map((sug, idx) => (
                    <li key={idx} className="marker:text-blue-500">{sug}</li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Missing Skills Chips Display */}
            <div className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Missing Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(analysisResult.missingSkills || []).map((skill, idx) => (
                  <span key={idx} className="text-xs font-semibold px-3 py-1 bg-red-955/40 border border-red-900/50 text-red-400 rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider">Identified Strengths</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(analysisResult.strengths || []).map((str, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/40 border border-slate-900 rounded-lg space-y-1">
                      <span className="text-xs font-bold text-white block">{str.title}</span>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{str.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">Identified Weaknesses</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(analysisResult.weaknesses || []).map((wk, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/40 border border-slate-900 rounded-lg space-y-1">
                      <span className="text-xs font-bold text-white block">{wk.title}</span>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{wk.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Deep-Dive Analysis */}
            <div className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Projects Analysis Reports</h3>
              
              <div className="space-y-4">
                {(analysisResult.projectAnalysis || []).map((proj, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-900/60 pb-2">
                      <span className="font-bold text-white block">{proj.name}</span>
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">AI Assessment</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[9px] text-slate-500 uppercase font-bold block">Review Summary</span>
                        <p className="text-slate-400 leading-relaxed">{proj.review}</p>
                        
                        <div className="pt-2">
                          <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Key Actionables</span>
                          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                            {(proj.suggestions || []).map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-955/10 border border-blue-900/40 rounded-lg space-y-1">
                        <span className="text-[9px] text-blue-400 font-bold block uppercase">Recommended Bullet Point Refactor</span>
                        <p className="text-slate-300 leading-relaxed font-medium italic">
                          "{proj.improved}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {(!analysisResult.projectAnalysis || analysisResult.projectAnalysis.length === 0) && (
                  <div className="text-slate-550 text-xs italic text-center py-4 bg-slate-950/40 rounded-lg border border-slate-900">
                    No distinct SDE projects identified in the parsed document.
                  </div>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-4 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4">
                <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-lg text-white transition-all shadow-md shadow-blue-500/10">
                  <Download className="w-3.5 h-3.5" /> Download PDF Report
                </button>
                <button
                  onClick={resetAnalyzer}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 border border-slate-900 hover:bg-slate-900 text-xs font-semibold rounded-lg text-slate-300 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Upload Different Resume
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  disabled
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-900 text-slate-655 text-xs font-semibold rounded-lg cursor-not-allowed"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Ask AI About Resume
                </button>
                <button
                  disabled
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-900 text-slate-655 text-xs font-semibold rounded-lg cursor-not-allowed"
                >
                  <Video className="w-3.5 h-3.5" /> Generate Interview Questions
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
