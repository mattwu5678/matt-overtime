import React, { useState, useMemo, useEffect } from 'react';
import { 
  Clock, 
  FileText, 
  CheckCircle, 
  Search, 
  Settings, 
  PlusCircle, 
  Check, 
  X, 
  Filter,
  User,
  Calendar,
  ChevronRight,
  AlertCircle,
  Menu,
  LogOut,
  ArrowRight,
  UserPlus,
  Briefcase,
  Timer,
  Info,
  History,
  Hash
} from 'lucide-react';

// 預設員工資料庫 (用於自動帶出功能與模擬驗證)
const EMPLOYEE_DB = [
  { id: '1024', name: '王大錘', department: '行政管理部' },
  { id: '1025', name: '李華', department: '工程部' },
  { id: '2011', name: '張三', department: '會計部' },
  { id: '3001', name: '陳小明', department: '業務部' },
];

// 模擬當前登入者資訊
const CURRENT_LOGGED_USER = { id: '1024', name: '王大錘' };

const INITIAL_DATA = [
  { 
    id: '20240520-001', 
    employeeId: '1024',
    applicant: '王大錘',
    type: '事前', 
    category: '一般上班日',
    reimbursementType: '補休',
    startDateTime: '2024-05-20 18:00', 
    endDateTime: '2024-05-20 20:00', 
    totalHours: '2.0',
    reason: '專案上線準備', 
    status: '待簽核', 
    department: '行政管理部' 
  },
  { 
    id: '20240518-002', 
    employeeId: '1025',
    applicant: '李華',
    type: '事後', 
    category: '休息日',
    reimbursementType: '計薪',
    startDateTime: '2024-05-18 22:00', 
    endDateTime: '2024-05-19 02:30', 
    totalHours: '4.5',
    reason: '修復緊急跨日 Bug', 
    status: '已核准', 
    department: '工程部' 
  },
];

const App = () => {
  const [activeTab, setActiveTab] = useState('apply');
  const [records, setRecords] = useState(INITIAL_DATA);
  const [isSupervisor, setIsSupervisor] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // 處理資訊日誌
  const [submissionLogs, setSubmissionLogs] = useState([]);
  
  // 生成流水號邏輯 (YYYYMMDD-序號)
  const currentSerialNumber = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;
    const sequence = String(records.length + 1).padStart(3, '0');
    return `${datePrefix}-${sequence}`;
  }, [records.length]);

  // 表單狀態 - 時與分初始化為空字串，以顯示 "--"
  const [formData, setFormData] = useState({
    employeeId: CURRENT_LOGGED_USER.id,
    employeeName: CURRENT_LOGGED_USER.name,
    type: '事前',
    category: '一般上班日',
    reimbursementType: '補休',
    startDate: '',
    startHour: '',
    startMinute: '',
    endDate: '',
    endHour: '',
    endMinute: '',
    reason: '',
  });

  // 處理員編輸入連動姓名
  const handleEmployeeIdChange = (id) => {
    const found = EMPLOYEE_DB.find(emp => emp.id === id);
    setFormData(prev => ({
      ...prev,
      employeeId: id,
      employeeName: found ? found.name : prev.employeeName 
    }));
  };

  // 處理姓名輸入連動員編
  const handleEmployeeNameChange = (name) => {
    const found = EMPLOYEE_DB.find(emp => emp.name === name);
    setFormData(prev => ({
      ...prev,
      employeeName: name,
      employeeId: found ? found.id : prev.employeeId 
    }));
  };

  // 自動同步結束日期
  useEffect(() => {
    if (formData.startDate && !formData.endDate) {
      setFormData(prev => ({ ...prev, endDate: prev.startDate }));
    }
  }, [formData.startDate]);

  const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

  // 計算工時 - 需檢查時分是否已選擇
  const calculatedHours = useMemo(() => {
    if (
      !formData.startDate || !formData.endDate || 
      formData.startHour === '' || formData.startMinute === '' || 
      formData.endHour === '' || formData.endMinute === ''
    ) return "0.0";

    const start = new Date(`${formData.startDate}T${formData.startHour}:${formData.startMinute}:00`);
    const end = new Date(`${formData.endDate}T${formData.endHour}:${formData.endMinute}:00`);
    const diffMs = end - start;
    if (diffMs <= 0) return "0.0";
    return (diffMs / (1000 * 60 * 60)).toFixed(1);
  }, [formData.startDate, formData.startHour, formData.startMinute, formData.endDate, formData.endHour, formData.endMinute]);

  // 檢查表單是否完整
  const isFormValid = useMemo(() => {
    return parseFloat(calculatedHours) > 0 && formData.reason.trim() !== '';
  }, [calculatedHours, formData.reason]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const foundEmp = EMPLOYEE_DB.find(emp => emp.id === formData.employeeId) || { department: '其他部門' };
    
    // 鎖定當前的流水號用於紀錄
    const submittedId = currentSerialNumber;

    const newRecord = {
      id: submittedId,
      employeeId: formData.employeeId,
      applicant: formData.employeeName,
      type: formData.type,
      category: formData.category,
      reimbursementType: formData.reimbursementType,
      startDateTime: `${formData.startDate} ${formData.startHour}:${formData.startMinute}`,
      endDateTime: `${formData.endDate} ${formData.endHour}:${formData.endMinute}`,
      totalHours: calculatedHours,
      reason: formData.reason,
      status: '待簽核',
      department: foundEmp.department
    };
    
    setRecords([newRecord, ...records]);
    
    // 產生提交紀錄
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-TW', { hour12: false });
    setSubmissionLogs(prev => [`單據編號 ${submittedId} 已於 ${timeStr} 成功送出`, ...prev]);

    // 重置表單為預設狀態
    setFormData({ 
      employeeId: CURRENT_LOGGED_USER.id, 
      employeeName: CURRENT_LOGGED_USER.name, 
      type: '事前', 
      category: '一般上班日', 
      reimbursementType: '補休', 
      startDate: '', 
      startHour: '', 
      startMinute: '', 
      endDate: '', 
      endHour: '', 
      endMinute: '', 
      reason: '' 
    });
  };

  const handleApprove = (id, newStatus) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const handleDateClick = (e) => {
    try {
      if (e.currentTarget && typeof e.currentTarget.showPicker === 'function') {
        e.currentTarget.showPicker();
      }
    } catch (err) {}
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'apply':
        return (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-left font-sans">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <PlusCircle size={20} className="text-blue-600" /> 加班申請單
                </h2>
                <div className="text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 flex items-center gap-1.5 uppercase">
                  <Hash size={12} /> 申請單流水號：{currentSerialNumber}
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 申報性質 */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FileText size={16} className="text-blue-600"/> 申報性質
                  </label>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                    <div className="flex gap-3 shrink-0">
                      {['事前', '事後'].map(t => (
                        <button
                          key={t} type="button" onClick={() => setFormData({...formData, type: t})}
                          className={`px-6 py-2.5 rounded-xl border-2 transition-all flex items-center justify-center gap-2 text-sm font-bold ${
                            formData.type === t 
                            ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          {t}加班
                        </button>
                      ))}
                    </div>
                    <div className="md:ml-auto flex items-center gap-2 text-sm font-bold text-blue-700 bg-blue-50 px-6 py-2.5 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-right-2">
                      <AlertCircle size={16} />
                      {formData.type === '事前' ? '請於加班前完成送出' : '請於加班後 3 日內完成申請'}
                    </div>
                  </div>
                </div>

                {/* 申請人資訊與類別 */}
                <div className="flex flex-col md:flex-row gap-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="md:w-32 space-y-2">
                    <label className="text-xs font-bold text-slate-500">員工編號</label>
                    <input
                      type="text" required maxLength={4} placeholder="1024"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                      value={formData.employeeId} 
                      onChange={(e) => handleEmployeeIdChange(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-bold text-slate-500">員工姓名</label>
                    <input
                      type="text" required placeholder="請輸入姓名"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                      value={formData.employeeName} 
                      onChange={(e) => handleEmployeeNameChange(e.target.value)}
                    />
                  </div>
                  <div className="md:w-48 space-y-2">
                    <label className="text-xs font-bold text-slate-500">加班類別</label>
                    <select
                      required className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                      value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="一般上班日">一般上班日</option>
                      <option value="國定假日">國定假日</option>
                      <option value="休息日">休息日</option>
                      <option value="出差加班">出差加班</option>
                    </select>
                  </div>
                </div>

                {/* 加班時間 */}
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-blue-700 font-bold text-xs mb-4 uppercase tracking-widest">起始日期與時間</div>
                    <div className="flex flex-col md:flex-row gap-4 font-sans">
                      <div className="w-full md:w-44 relative">
                        <input
                          type="date" required onClick={handleDateClick}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-sans cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                          value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        />
                      </div>
                      <div className="flex gap-2">
                        <select className="w-28 p-3 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500" value={formData.startHour} onChange={(e) => setFormData({...formData, startHour: e.target.value})}>
                          <option value="">-- 時</option>
                          {hourOptions.map(h => <option key={h} value={h}>{h} 時</option>)}
                        </select>
                        <select className="w-28 p-3 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500" value={formData.startMinute} onChange={(e) => setFormData({...formData, startMinute: e.target.value})}>
                          <option value="">-- 分</option>
                          <option value="00">00 分</option>
                          <option value="30">30 分</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-sans">
                    <div className="flex items-center gap-2 text-orange-700 font-bold text-xs mb-4 uppercase tracking-widest">結束日期與時間</div>
                    <div className="flex flex-col md:flex-row gap-4 font-sans">
                      <div className="w-full md:w-44 relative">
                        <input
                          type="date" required onClick={handleDateClick}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-sans cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                          value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        />
                      </div>
                      <div className="flex gap-2 font-sans">
                        <select className="w-28 p-3 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500" value={formData.endHour} onChange={(e) => setFormData({...formData, endHour: e.target.value})}>
                          <option value="">-- 時</option>
                          {hourOptions.map(h => <option key={h} value={h}>{h} 時</option>)}
                        </select>
                        <select className="w-28 p-3 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500" value={formData.endMinute} onChange={(e) => setFormData({...formData, endMinute: e.target.value})}>
                          <option value="">-- 分</option>
                          <option value="00">00 分</option>
                          <option value="30">30 分</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 補償方式與自動結算並排 (淺色風格) */}
                <div className="flex flex-col md:flex-row items-stretch gap-4">
                  <div className="flex-1 p-5 bg-slate-50/80 rounded-2xl border border-slate-100 flex flex-col justify-center">
                    <label className="text-xs font-bold text-slate-500 mb-3">補償方式</label>
                    <div className="flex gap-3">
                      {['補休', '計薪'].map(r => (
                        <button
                          key={r} type="button" onClick={() => setFormData({...formData, reimbursementType: r})}
                          className={`flex-1 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 text-sm font-bold ${formData.reimbursementType === r ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm' : 'bg-white border-slate-100 text-slate-400'}`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 自動結算區塊 */}
                  <div className="md:w-80 p-5 bg-slate-50/80 rounded-2xl flex items-center justify-between border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Timer className="text-blue-600" size={18} />
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider whitespace-nowrap">自動結算總時數</p>
                    </div>
                    <div className="flex items-baseline gap-1 ml-4 shrink-0">
                      <span className="text-3xl font-black font-mono text-blue-600 tracking-tighter leading-none">{calculatedHours}</span>
                      <span className="text-xs font-bold text-slate-400">小時</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                    加班事由說明 <span className="text-red-500 font-black">*</span>
                  </label>
                  <textarea
                    rows="3" required placeholder="請詳細描述加班原因、欲達成之目標或工作內容..."
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-sans"
                    value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  ></textarea>
                </div>

                <div className="pt-4 font-sans">
                  <button
                    type="submit" disabled={!isFormValid}
                    className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isFormValid ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                  >
                    <CheckCircle size={20} /> 提交加班申請案
                  </button>
                  {!isFormValid && (
                    <div className="mt-3 space-y-1 text-center">
                      {(parseFloat(calculatedHours) <= 0 && formData.startDate && formData.startHour && formData.endHour) ? (
                        <p className="text-[11px] text-red-500 font-bold font-sans">⚠️ 結束時間必須晚於開始時間。</p>
                      ) : null}
                      {formData.reason.trim() === '' && (
                        <p className="text-[11px] text-slate-400 font-bold font-sans">📝 請完整填寫日期、時間與事由後方可提交。</p>
                      )}
                    </div>
                  )}
                </div>
              </form>

              {/* 下方資訊顯示欄 (處理狀態紀錄) */}
              {submissionLogs.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2 text-slate-800 font-bold mb-3 text-sm">
                    <History size={16} className="text-blue-600" />
                    <span>處理資訊日誌</span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {submissionLogs.map((log, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-[12px] text-emerald-700 font-bold animate-in zoom-in-95 duration-300">
                        <CheckCircle size={14} className="shrink-0" />
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 注意事項 */}
              <div className="mt-12 p-6 bg-amber-50 border border-amber-200 rounded-2xl text-left font-sans">
                <div className="flex items-center gap-2 text-amber-800 font-bold mb-4 border-b border-amber-200 pb-2 tracking-wider text-sm">
                  <AlertCircle size={18} />
                  <span>加班申請注意事項</span>
                </div>
                <ul className="space-y-3 text-sm text-amber-900/80 leading-relaxed">
                  <li className="flex gap-2">
                    <span className="shrink-0 bg-amber-200 text-amber-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">A</span>
                    <span>加班申請須事前由直屬主管核准，始得進行加班，並於事後呈主管審核確認。</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="shrink-0 bg-amber-200 text-amber-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">B</span>
                    <span>此單由各部門編序號並於加班後<span className="text-amber-900 font-bold underline">七個工作日內</span>交至財務行政部辦理，逾期不受理。</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="shrink-0 bg-amber-200 text-amber-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">C</span>
                    <span>此加班工時將依比率換算為補休時數或薪資。</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="shrink-0 bg-amber-200 text-amber-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">D</span>
                    <span>每月加班時數上限不得超過 <span className="text-red-600 font-bold">46 小時</span>。</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'approve':
        return (
          <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left font-sans">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">待簽核加班清單</h2>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                目前有 {records.filter(r => r.status === '待簽核').length} 筆待處理
              </span>
            </div>
            {records.filter(r => r.status === '待簽核').length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-medium">目前沒有任何待簽核的加班申請案</div>
            ) : (
              records.filter(r => r.status === '待簽核').map(record => (
                <div key={record.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                  <div className="flex-1 space-y-3 w-full font-sans">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold font-mono">單號: {record.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${record.reimbursementType === '補休' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{record.reimbursementType}</span>
                      <div className="flex items-center gap-1 bg-slate-800 text-white px-2 py-1 rounded text-xs font-bold font-mono">
                        <Timer size={12} className="text-blue-400" /> {record.totalHours} 小時
                      </div>
                      <h3 className="font-bold text-lg text-slate-800 ml-1 font-sans">{record.applicant}</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs font-mono text-slate-500 font-bold">
                      <div className="bg-slate-50 px-3 py-1.5 rounded-lg">開始：{record.startDateTime}</div>
                      <ArrowRight size={14} className="text-slate-300 hidden sm:block" />
                      <div className="bg-slate-50 px-3 py-1.5 rounded-lg">結束：{record.endDateTime}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 border-l-4 border-slate-300 font-sans italic">事由：{record.reason}</div>
                  </div>
                  <div className="flex gap-2 w-full xl:w-auto shrink-0 font-sans">
                    <button onClick={() => handleApprove(record.id, '已核准')} className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95"><Check size={18} /> 核准</button>
                    <button onClick={() => handleApprove(record.id, '已駁回')} className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-500 border border-red-100 px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95"><X size={18} /> 駁回</button>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'query':
        return (
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500 text-left font-sans">
            <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
              <h2 className="font-bold text-lg text-slate-800 font-sans">加班紀錄查詢與彙整</h2>
              <div className="relative font-sans">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="搜尋單號、姓名或工號..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 w-64 font-sans" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-black border-b border-slate-50 bg-slate-50/30">
                    <th className="px-6 py-4 text-left font-sans">單號</th>
                    <th className="px-6 py-4 text-left font-sans">姓名 / 工號</th>
                    <th className="px-6 py-4 text-left font-sans">加班時段</th>
                    <th className="px-6 py-4 text-left font-sans">時數 / 補償</th>
                    <th className="px-6 py-4 text-center font-sans">狀態</th>
                    <th className="px-6 py-4 text-right font-sans">動作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {records.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors font-sans">
                      <td className="px-6 py-4 font-mono text-[10px] font-bold text-slate-500">{record.id}</td>
                      <td className="px-6 py-4 font-sans">
                        <div className="font-bold text-slate-800 text-sm">{record.applicant}</div>
                        <div className="text-[10px] text-slate-400 font-mono tracking-tighter">#{record.employeeId}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px]">
                        <div className="text-slate-700">始：{record.startDateTime}</div>
                        <div className="text-slate-400">迄：{record.endDateTime}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-sans">
                          <span className="text-blue-600 font-mono font-black text-sm">{record.totalHours}H</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${record.reimbursementType === '補休' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{record.reimbursementType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold ${record.status === '已核准' ? 'bg-green-50 text-green-600' : record.status === '待簽核' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>{record.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-300 hover:text-blue-600 transition-colors"><ChevronRight size={20} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500 text-left font-sans">
            <div className="lg:col-span-1 text-center font-sans">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4 border border-blue-200 font-black uppercase font-sans">Admin</div>
                <h3 className="font-bold text-lg text-slate-800 font-sans">王大錘 經理</h3>
                <p className="text-slate-400 text-[10px] mb-6 font-mono font-bold uppercase">工號: 1024</p>
                <button 
                  onClick={() => setIsSupervisor(!isSupervisor)}
                  className={`w-full py-2.5 rounded-xl font-bold transition-all border-2 text-sm ${isSupervisor ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {isSupervisor ? '目前身份：管理員' : '目前身份：一般員工'}
                </button>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4 font-sans">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2"><Settings size={16} /> 系統參數設定</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-700">自動生成單據流水號</div>
                    <span className="text-[10px] font-bold text-blue-600 bg-white border border-blue-100 px-2 py-0.5 rounded-lg font-mono">{currentSerialNumber}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-700">預設登入者自動帶入</div>
                    <span className="text-[10px] font-bold text-green-600 bg-white border border-green-100 px-2 py-0.5 rounded-lg">啟用中</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans antialiased text-slate-900">
      {/* 側邊導覽 */}
      <aside className={`bg-slate-900 text-white flex flex-col transition-all duration-300 z-50 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden font-sans">
            <div className="bg-blue-600 p-2 rounded-xl shrink-0 shadow-lg">
              <FileText size={20} className="text-white" />
            </div>
            {isSidebarOpen && (
              <div className="whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                <h1 className="text-sm font-black tracking-tight text-slate-100 uppercase font-sans">內部管理系統</h1>
              </div>
            )}
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
            <Menu size={18} />
          </button>
        </div>

        <div className="flex-1 px-3 py-6 space-y-6 font-sans">
           {isSidebarOpen && (
             <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">系統狀態</h4>
               <div className="space-y-3">
                 <div className="flex items-center justify-between text-[11px] font-bold">
                   <span className="text-slate-500">使用者</span>
                   <span className="text-blue-400">王大錘</span>
                 </div>
                 <div className="flex items-center justify-between text-[11px] font-bold">
                   <span className="text-slate-500">權限</span>
                   <span className={isSupervisor ? "text-green-400" : "text-slate-400"}>{isSupervisor ? "管理員" : "一般"}</span>
                 </div>
               </div>
             </div>
           )}
        </div>

        <div className="p-3 border-t border-slate-800 font-sans">
          <div className={`flex items-center p-3 bg-slate-800/50 rounded-2xl ${!isSidebarOpen && 'justify-center'}`}>
            <User size={18} className="text-blue-400 shrink-0" />
            {isSidebarOpen && (
              <div className="ml-3 overflow-hidden text-left animate-in fade-in duration-300">
                <p className="text-[11px] font-bold text-slate-500 font-mono tracking-tighter uppercase">ID #1024</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 主要內容區 */}
      <main className="flex-1 flex flex-col overflow-hidden font-sans">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-1 h-full">
            <TabItem active={activeTab === 'apply'} label="加班申請" onClick={() => setActiveTab('apply')} />
            {isSupervisor && (
              <TabItem active={activeTab === 'approve'} label="主管簽核" onClick={() => setActiveTab('approve')} badge={records.filter(r => r.status === '待簽核').length} />
            )}
            <TabItem active={activeTab === 'query'} label="紀錄查詢" onClick={() => setActiveTab('query')} />
            <TabItem active={activeTab === 'settings'} label="系統設定" onClick={() => setActiveTab('settings')} />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-[11px] text-slate-400 font-mono font-black tracking-widest">{new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')}</div>
            <button className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 font-sans">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// 輔助組件：頂部標籤
const TabItem = ({ active, label, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`h-full px-6 flex items-center gap-2 transition-all relative font-black text-[13px] ${
      active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-800'
    }`}
  >
    {label}
    {badge > 0 && (
      <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] rounded-full min-w-[16px] text-center font-black animate-pulse">
        {badge}
      </span>
    )}
    {active && (
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>
    )}
  </button>
);

export default App;