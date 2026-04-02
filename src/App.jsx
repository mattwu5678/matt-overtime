<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>內部管理系統 - 加班申請</title>
    <!-- 載入 Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- 載入 React & Babel -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <!-- 載入 Lucide 圖示庫 -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap');
        body { font-family: 'Noto Sans TC', sans-serif; }
        input[type="date"]::-webkit-calendar-picker-indicator {
            cursor: pointer;
        }
    </style>
</head>
<body class="bg-slate-50">
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useMemo, useEffect } = React;
        
        // 模擬 Lucide 圖示組件
        const Icon = ({ name, size = 20, className = "" }) => {
            useEffect(() => {
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            }, [name]);
            return <i data-lucide={name} style={{ width: size, height: size }} className={className}></i>;
        };

        // 預設員工資料庫
        const EMPLOYEE_DB = [
            { id: '1024', name: '王大錘', department: '行政管理部' },
            { id: '1025', name: '李華', department: '工程部' },
            { id: '2011', name: '張三', department: '會計部' },
            { id: '3001', name: '陳小明', department: '業務部' },
        ];

        const CURRENT_LOGGED_USER = { id: '1024', name: '王大錘' };

        const App = () => {
            const [activeTab, setActiveTab] = useState('apply');
            const [records, setRecords] = useState([
                { id: '20240520-001', employeeId: '1024', applicant: '王大錘', type: '事前', category: '一般上班日', reimbursementType: '補休', startDateTime: '2024-05-20 18:00', endDateTime: '2024-05-20 20:00', totalHours: '2.0', reason: '專案上線準備', status: '待簽核', department: '行政管理部' },
                { id: '20240518-002', employeeId: '1025', applicant: '李華', type: '事後', category: '休息日', reimbursementType: '計薪', startDateTime: '2024-05-18 22:00', endDateTime: '2024-05-19 02:30', totalHours: '4.5', reason: '修復緊急跨日故障', status: '已核准', department: '工程部' },
            ]);
            const [isSupervisor, setIsSupervisor] = useState(true);
            const [isSidebarOpen, setIsSidebarOpen] = useState(true);

            // 定義小時選項 (24小時制)
            const hourOptions = useMemo(() => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')), []);

            const currentSerialNumber = useMemo(() => {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                return `${year}${month}${day}-${String(records.length + 1).padStart(3, '0')}`;
            }, [records.length]);

            const [formData, setFormData] = useState({
                employeeId: CURRENT_LOGGED_USER.id,
                employeeName: CURRENT_LOGGED_USER.name,
                type: '事前', category: '一般上班日', reimbursementType: '補休',
                startDate: '', startHour: '18', startMinute: '00', endDate: '', endHour: '20', endMinute: '00', reason: '',
            });

            const handleEmployeeIdChange = (id) => {
                const found = EMPLOYEE_DB.find(emp => emp.id === id);
                setFormData(prev => ({ ...prev, employeeId: id, employeeName: found ? found.name : prev.employeeName }));
            };

            const handleEmployeeNameChange = (name) => {
                const found = EMPLOYEE_DB.find(emp => emp.name === name);
                setFormData(prev => ({ ...prev, employeeName: name, employeeId: found ? found.id : prev.employeeId }));
            };

            useEffect(() => {
                if (formData.startDate && !formData.endDate) {
                    setFormData(prev => ({ ...prev, endDate: prev.startDate }));
                }
            }, [formData.startDate]);

            const calculatedHours = useMemo(() => {
                if (!formData.startDate || !formData.endDate) return "0.0";
                const start = new Date(`${formData.startDate}T${formData.startHour}:${formData.startMinute}:00`);
                const end = new Date(`${formData.endDate}T${formData.endHour}:${formData.endMinute}:00`);
                const diffMs = end - start;
                return diffMs <= 0 ? "0.0" : (diffMs / (1000 * 60 * 60)).toFixed(1);
            }, [formData.startDate, formData.startHour, formData.startMinute, formData.endDate, formData.endHour, formData.endMinute]);

            const handleSubmit = (e) => {
                e.preventDefault();
                if (parseFloat(calculatedHours) <= 0) return;
                const foundEmp = EMPLOYEE_DB.find(emp => emp.id === formData.employeeId) || { department: '其他部門' };
                const newRecord = {
                    id: currentSerialNumber, employeeId: formData.employeeId, applicant: formData.employeeName,
                    type: formData.type, category: formData.category, reimbursementType: formData.reimbursementType,
                    startDateTime: `${formData.startDate} ${formData.startHour}:${formData.startMinute}`,
                    endDateTime: `${formData.endDate} ${formData.endHour}:${formData.endMinute}`,
                    totalHours: calculatedHours, reason: formData.reason, status: '待簽核', department: foundEmp.department
                };
                setRecords([newRecord, ...records]);
                setFormData({ 
                    employeeId: CURRENT_LOGGED_USER.id, employeeName: CURRENT_LOGGED_USER.name, 
                    type: '事前', category: '一般上班日', reimbursementType: '補休',
                    startDate: '', startHour: '18', startMinute: '00', endDate: '', endHour: '20', endMinute: '00', reason: '' 
                });
                setActiveTab('query');
            };

            const handleDateClick = (e) => {
                try { if (e.currentTarget.showPicker) e.currentTarget.showPicker(); } catch (err) {}
            };

            const handleApprove = (id, newStatus) => {
                setRecords(records.map(r => r.id === id ? { ...r, status: newStatus } : r));
            };

            const renderContent = () => {
                if (activeTab === 'apply') return (
                    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-left">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 font-sans">
                                    <Icon name="plus-circle" className="text-blue-600" /> 加班申請表單
                                </h2>
                                <div className="text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 flex items-center gap-1.5 uppercase">
                                    <Icon name="hash" size={12} /> 目前申請單號：{currentSerialNumber}
                                </div>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Icon name="file-text" className="text-blue-600" size={16}/> 申報性質</label>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                                        <div className="flex gap-3 shrink-0">
                                            {['事前', '事後'].map(t => (
                                                <button key={t} type="button" onClick={() => setFormData({...formData, type: t})}
                                                  className={`px-6 py-2.5 rounded-xl border-2 transition-all font-bold text-sm ${formData.type === t ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}>{t}加班</button>
                                            ))}
                                        </div>
                                        <div className="md:ml-auto flex items-center gap-2 text-sm font-bold text-blue-700 bg-blue-50 px-6 py-2.5 rounded-xl border border-blue-100">
                                            <Icon name="alert-circle" size={16} /> {formData.type === '事前' ? '請於加班前完成送出' : '請於加班後 3 日內完成申請'}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500">員工編號 (可修改)</label>
                                        <input type="text" required maxLength={4} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono" value={formData.employeeId} onChange={(e) => handleEmployeeIdChange(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500">員工姓名 (可修改)</label>
                                        <input type="text" required className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500" value={formData.employeeName} onChange={(e) => handleEmployeeNameChange(e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">補償方式</label>
                                        <div className="flex gap-3">
                                            {['補休', '計薪'].map(r => (
                                                <button key={r} type="button" onClick={() => setFormData({...formData, reimbursementType: r})} className={`flex-1 py-2.5 rounded-xl border-2 transition-all font-bold text-sm ${formData.reimbursementType === r ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm' : 'bg-white border-slate-100 text-slate-400'}`}>{r}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2 font-sans text-left">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">加班類別</label>
                                        <select required className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                                            <option value="一般上班日">一般上班日</option><option value="國定假日">國定假日</option><option value="休息日">休息日</option><option value="出差加班">出差加班</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-sans">
                                        <div className="flex items-center gap-2 text-blue-700 font-bold text-xs mb-4 uppercase tracking-widest">起始日期與時間</div>
                                        <div className="flex flex-col md:flex-row gap-4 font-sans">
                                            <div className="w-full md:w-44">
                                                <input type="date" required onClick={handleDateClick} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-sans cursor-pointer focus:ring-2 focus:ring-blue-500" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                                            </div>
                                            <div className="flex flex-1 gap-2">
                                                <select className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500" value={formData.startHour} onChange={(e) => setFormData({...formData, startHour: e.target.value})}>{hourOptions.map(h => <option key={h} value={h}>{h} 時</option>)}</select>
                                                <select className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500" value={formData.startMinute} onChange={(e) => setFormData({...formData, startMinute: e.target.value})}><option value="00">00 分</option><option value="30">30 分</option></select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-sans">
                                        <div className="flex items-center gap-2 text-orange-700 font-bold text-xs mb-4 uppercase tracking-widest">結束日期與時間</div>
                                        <div className="flex flex-col md:flex-row gap-4 font-sans">
                                            <div className="w-full md:w-44">
                                                <input type="date" required onClick={handleDateClick} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-sans cursor-pointer focus:ring-2 focus:ring-blue-500" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                                            </div>
                                            <div className="flex flex-1 gap-2 font-sans">
                                                <select className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500" value={formData.endHour} onChange={(e) => setFormData({...formData, endHour: e.target.value})}>{hourOptions.map(h => <option key={h} value={h}>{h} 時</option>)}</select>
                                                <select className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500" value={formData.endMinute} onChange={(e) => setFormData({...formData, endMinute: e.target.value})}><option value="00">00 分</option><option value="30">30 分</option></select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl text-white shadow-xl">
                                    <div className="flex items-center gap-3"><Icon name="timer" className="text-blue-400" size={24} /><div className="text-left font-sans"><p className="text-xs text-slate-400 font-bold uppercase">自動結算總時數</p></div></div>
                                    <div className="text-right font-sans"><span className="text-3xl font-black font-mono text-blue-400 tracking-tighter">{calculatedHours}</span><span className="ml-1 text-sm font-bold text-slate-400">小時</span></div>
                                </div>
                                <div className="space-y-2 text-left font-sans"><label className="text-sm font-bold text-slate-700">加班事由說明</label><textarea rows="3" required placeholder="請詳細描述加班原因或工作內容..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-sans" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})}></textarea></div>
                                <div className="pt-4 font-sans font-bold">
                                    <button type="submit" disabled={parseFloat(calculatedHours) <= 0} className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${parseFloat(calculatedHours) > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                                        <Icon name="check-circle" size={20} /> 提交加班申請案
                                    </button>
                                    {parseFloat(calculatedHours) <= 0 && formData.startDate && <p className="text-xs text-red-500 mt-2 text-center font-bold font-sans italic">⚠️ 結束時間必須晚於開始時間。</p>}
                                </div>
                            </form>
                            <div className="mt-12 p-6 bg-amber-50 border border-amber-200 rounded-2xl text-left font-sans shadow-sm">
                                <div className="flex items-center gap-2 text-amber-800 font-bold mb-4 border-b border-amber-200 pb-2 tracking-wider text-sm font-sans"><Icon name="alert-circle" size={18} /><span>加班申請注意事項</span></div>
                                <ul className="space-y-3 text-sm text-amber-900/80 leading-relaxed font-sans">
                                    <li className="flex gap-2"><span className="shrink-0 bg-amber-200 text-amber-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">A</span><span>加班申請須事前由直屬主管核准，始得進行加班。</span></li>
                                    <li className="flex gap-2"><span className="shrink-0 bg-amber-200 text-amber-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">B</span><span>此單由各部門編序號並於加班後七個工作日內交至財務行政部辦理。</span></li>
                                    <li className="flex gap-2"><span className="shrink-0 bg-amber-200 text-amber-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">C</span><span>此加班工時將依比率換算為補休時數或薪資。</span></li>
                                    <li className="flex gap-2"><span className="shrink-0 bg-amber-200 text-amber-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">D</span><span>每月加班時數上限不得超過 46 小時。</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );
                
                if (activeTab === 'approve') return (
                    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left font-sans">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-800">待簽核加班單</h2>
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold font-sans">目前有 {records.filter(r => r.status === '待簽核').length} 筆待處理</span>
                        </div>
                        {records.filter(r => r.status === '待簽核').length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-medium">目前沒有待簽核的加班案</div>
                        ) : (
                            records.filter(r => r.status === '待簽核').map(record => (
                                <div key={record.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                                    <div className="flex-1 space-y-3 w-full font-sans">
                                        <div className="flex items-center flex-wrap gap-2 font-sans">
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold font-mono">單號: {record.id}</span>
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold border ${record.reimbursementType === '補休' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{record.reimbursementType}</span>
                                            <div className="flex items-center gap-1 bg-slate-800 text-white px-2 py-1 rounded text-xs font-bold font-mono"><Icon name="timer" className="text-blue-400" size={12} /> {record.totalHours} 小時</div>
                                            <h3 className="font-bold text-lg text-slate-800 ml-1">{record.applicant}</h3>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs font-mono text-slate-500 font-bold">
                                            <div className="bg-slate-50 px-3 py-1.5 rounded-lg">開始：{record.startDateTime}</div><Icon name="arrow-right" size={14} className="text-slate-300 hidden sm:block" /><div className="bg-slate-50 px-3 py-1.5 rounded-lg">結束：{record.endDateTime}</div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 border-l-4 border-slate-300 italic font-sans">事由：{record.reason}</div>
                                    </div>
                                    <div className="flex gap-2 w-full xl:w-auto shrink-0 font-sans">
                                        <button onClick={() => handleApprove(record.id, '已核准')} className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm active:scale-95"><Icon name="check" size={18} /> 核准</button>
                                        <button onClick={() => handleApprove(record.id, '已駁回')} className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-500 border border-red-100 px-6 py-2.5 rounded-xl font-bold shadow-sm active:scale-95"><Icon name="x" size={18} /> 駁回</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                );
                
                if (activeTab === 'query') return (
                    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-left font-sans animate-in fade-in duration-500">
                        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
                            <h2 className="font-bold text-lg text-slate-800">加班紀錄查詢與彙整</h2>
                            <div className="relative font-sans"><Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="搜尋單號、姓名或工號..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 w-64" /></div>
                        </div>
                        <div className="overflow-x-auto"><table className="w-full font-sans"><thead><tr className="text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-50 bg-slate-50/30 font-sans"><th className="px-6 py-4 text-left">單號</th><th className="px-6 py-4 text-left">姓名 / 工號</th><th className="px-6 py-4 text-left">加班時段</th><th className="px-6 py-4 text-left">時數</th><th className="px-6 py-4 text-center">狀態</th><th className="px-6 py-4 text-right">動作</th></tr></thead>
                        <tbody className="divide-y divide-slate-50 font-sans">{records.map(record => (
                            <tr key={record.id} className="hover:bg-slate-50/80 transition-colors"><td className="px-6 py-4 font-mono text-[10px] font-bold text-slate-500">{record.id}</td><td className="px-6 py-4 font-sans font-bold"><div className="text-slate-800 text-sm">{record.applicant}</div><div className="text-[10px] text-slate-400 font-mono tracking-tighter">#{record.employeeId}</div></td><td className="px-6 py-4 font-mono text-[10px] leading-relaxed"><div className="text-slate-700">始：{record.startDateTime}</div><div className="text-slate-400">迄：{record.endDateTime}</div></td><td className="px-6 py-4 font-sans font-black text-blue-600">{record.totalHours}H</td><td className="px-6 py-4 text-center font-sans"><span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold ${record.status === '已核准' ? 'bg-green-50 text-green-600' : record.status === '待簽核' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>{record.status}</span></td><td className="px-6 py-4 text-right"><Icon name="chevron-right" className="text-slate-300 inline" size={20} /></td></tr>
                        ))}</tbody></table></div>
                    </div>
                );

                if (activeTab === 'settings') return (
                    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500 text-left font-sans">
                        <div className="lg:col-span-1 text-center font-sans">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 shadow-sm">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4 border border-blue-200 font-black uppercase shadow-inner tracking-widest text-xs">Admin</div>
                                <h3 className="font-bold text-lg text-slate-800">王大錘 經理</h3>
                                <p className="text-slate-400 text-[10px] mb-6 font-mono font-bold uppercase tracking-widest">ID: 1024</p>
                                <button onClick={() => setIsSupervisor(!isSupervisor)} className={`w-full py-3 rounded-xl font-bold transition-all border-2 text-sm ${isSupervisor ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                    {isSupervisor ? '切換：管理員視角' : '切換：員工視角'}
                                </button>
                            </div>
                        </div>
                        <div className="lg:col-span-2 space-y-4 font-sans">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 font-sans">
                                <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2 font-sans"><Icon name="settings" size={16} /> 系統自動化參數</h3>
                                <div className="space-y-4 font-sans">
                                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="text-xs font-bold text-slate-700">自動生成單據流水號</div>
                                        <span className="text-[10px] font-bold text-blue-600 bg-white border border-blue-100 px-3 py-1 rounded-lg font-mono">{currentSerialNumber}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 font-sans">
                                        <div className="text-xs font-bold text-slate-700">自動帶入員工資訊</div>
                                        <span className="text-[10px] font-bold text-green-600 bg-white border border-green-100 px-3 py-1 rounded-lg font-sans">啟用中</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
                return null;
            };

            return (
                <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans text-slate-900">
                    <aside className={`bg-slate-900 text-white flex flex-col transition-all duration-300 z-50 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 font-sans">
                            <div className="flex items-center gap-3 overflow-hidden font-sans">
                                <div className="bg-blue-600 p-2 rounded-xl shrink-0 shadow-lg border border-blue-500/20"><Icon name="file-text" className="text-white" size={20} /></div>
                                {isSidebarOpen && <div className="whitespace-nowrap font-black font-sans tracking-tight animate-in fade-in slide-in-from-left-2">內部管理系統</div>}
                            </div>
                            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"><Icon name="menu" size={18} /></button>
                        </div>
                        <div className="flex-1 px-3 py-6 space-y-6 font-sans">
                           {isSidebarOpen && (
                             <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 font-bold text-[11px] animate-in fade-in duration-300">
                               <div className="flex justify-between text-slate-500 mb-3 uppercase tracking-widest">系統連線狀態</div>
                               <div className="flex justify-between text-blue-400 mb-2"><span>使用者</span><span className="font-bold">王大錘</span></div>
                               <div className="flex justify-between text-green-400"><span>權限層級</span><span className="font-bold">{isSupervisor ? "管理員" : "一般"}</span></div>
                             </div>
                           )}
                        </div>
                        <div className="p-3 border-t border-slate-800 font-sans tracking-tighter">
                            <div className={`flex items-center p-3 bg-slate-800/50 rounded-2xl ${!isSidebarOpen && 'justify-center'} shadow-inner`}>
                                <Icon name="user" className="text-blue-400 shrink-0" />
                                {isSidebarOpen && <div className="ml-3 text-[11px] font-bold text-slate-500 font-mono tracking-widest">ID #1024</div>}
                            </div>
                        </div>
                    </aside>
                    <main className="flex-1 flex flex-col overflow-hidden font-sans">
                        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md z-40 px-8 flex items-center justify-between font-sans">
                            <div className="flex items-center gap-1 font-sans h-full">
                                <button onClick={() => setActiveTab('apply')} className={`h-full px-6 flex items-center gap-2 transition-all relative font-black text-[13px] ${activeTab === 'apply' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                    加班申請 {activeTab === 'apply' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full shadow-lg shadow-blue-500/50 animate-in slide-in-from-bottom-1" />}
                                </button>
                                {isSupervisor && (
                                    <button onClick={() => setActiveTab('approve')} className={`h-full px-6 flex items-center gap-2 transition-all relative font-black text-[13px] ${activeTab === 'approve' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                        主管簽核 {records.filter(r=>r.status==='待簽核').length > 0 && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full min-w-[16px] text-center font-black animate-pulse">{records.filter(r=>r.status==='待簽核').length}</span>}
                                        {activeTab === 'approve' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full shadow-lg shadow-blue-500/50 animate-in slide-in-from-bottom-1" />}
                                    </button>
                                )}
                                <button onClick={() => setActiveTab('query')} className={`h-full px-6 flex items-center gap-2 transition-all relative font-black text-[13px] ${activeTab === 'query' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                    紀錄查詢 {activeTab === 'query' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full shadow-lg shadow-blue-500/50 animate-in slide-in-from-bottom-1" />}
                                </button>
                                <button onClick={() => setActiveTab('settings')} className={`h-full px-6 flex items-center gap-2 transition-all relative font-black text-[13px] ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                    系統設定 {activeTab === 'settings' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full shadow-lg shadow-blue-500/50 animate-in slide-in-from-bottom-1" />}
                                </button>
                            </div>
                            <div className="flex items-center gap-4 font-sans font-black text-[11px] text-slate-400 tracking-widest">{new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')}</div>
                        </header>
                        <div className="flex-1 overflow-y-auto p-8 font-sans">
                            {renderContent()}
                        </div>
                    </main>
                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>