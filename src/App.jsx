<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>企業加班申請系統 - 寬版</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap');
        body {
            font-family: 'Noto+Sans+TC', sans-serif;
            background-color: #f3f4f6;
        }
        .form-shadow {
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body class="p-4 md:p-10">

    <!-- 主容器：使用 max-w-6xl 實現加寬效果 -->
    <div class="max-w-6xl mx-auto">
        
        <!-- 頁首 -->
        <div class="bg-white rounded-t-2xl p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 class="text-3xl font-bold text-slate-800">加班申請單</h1>
                <p class="text-slate-500 mt-1">請填寫詳細加班資訊，提交後將由主管審核。</p>
            </div>
            <div class="text-right">
                <span class="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium border border-blue-100">
                    單據編號：OT-20240328-001
                </span>
            </div>
        </div>

        <!-- 主要內容區 -->
        <div class="bg-white p-8 form-shadow">
            <form id="overtimeForm" class="space-y-8">
                
                <!-- 區塊 1: 基本資訊 (網格佈局) -->
                <div>
                    <h2 class="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                        <span class="w-1 h-6 bg-blue-500 mr-2 rounded"></span>
                        基本資訊
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">申請人姓名</label>
                            <input type="text" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="例如：王小明">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">員工編號</label>
                            <input type="text" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="EMP12345">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">所屬部門</label>
                            <select class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                                <option>技術研發部</option>
                                <option>行銷企劃部</option>
                                <option>人力資源部</option>
                                <option>財務管理部</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- 區塊 2: 時間設定 -->
                <div>
                    <h2 class="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                        <span class="w-1 h-6 bg-blue-500 mr-2 rounded"></span>
                        時間設定
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">加班日期</label>
                            <input type="date" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">開始時間</label>
                            <input type="time" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">結束時間</label>
                            <input type="time" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                        </div>
                    </div>
                </div>

                <!-- 區塊 3: 詳細原因 -->
                <div>
                    <h2 class="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                        <span class="w-1 h-6 bg-blue-500 mr-2 rounded"></span>
                        詳細資訊
                    </h2>
                    <div class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">相關專案名稱</label>
                            <input type="text" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="請輸入專案名稱或代號">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">加班事由說明</label>
                            <textarea rows="4" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="請詳細說明加班工作內容..."></textarea>
                        </div>
                    </div>
                </div>

                <!-- 底部按鈕 -->
                <div class="flex justify-end gap-4 pt-6 border-t border-gray-100">
                    <button type="button" class="px-8 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition">
                        取消暫存
                    </button>
                    <button type="button" onclick="submitForm()" class="px-10 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition transform active:scale-95">
                        提交申請
                    </button>
                </div>
            </form>
        </div>

        <!-- 歷史記錄區 (呈現寬版表格優勢) -->
        <div class="mt-10 bg-white rounded-2xl p-8 form-shadow">
            <h2 class="text-xl font-bold text-slate-800 mb-6 italic">近期申請記錄</h2>
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="text-slate-400 text-sm border-b">
                            <th class="pb-4 font-medium">日期</th>
                            <th class="pb-4 font-medium">時段</th>
                            <th class="pb-4 font-medium">時數</th>
                            <th class="pb-4 font-medium">專案</th>
                            <th class="pb-4 font-medium text-right">狀態</th>
                        </tr>
                    </thead>
                    <tbody class="text-slate-600 divide-y">
                        <tr>
                            <td class="py-4">2024-03-25</td>
                            <td class="py-4">18:30 - 21:00</td>
                            <td class="py-4 font-semibold text-blue-600">2.5h</td>
                            <td class="py-4">官網升級計畫</td>
                            <td class="py-4 text-right">
                                <span class="bg-green-100 text-green-700 px-3 py-1 rounded-md text-xs font-bold">已核准</span>
                            </td>
                        </tr>
                        <tr>
                            <td class="py-4">2024-03-20</td>
                            <td class="py-4">19:00 - 22:30</td>
                            <td class="py-4 font-semibold text-blue-600">3.5h</td>
                            <td class="py-4">客戶系統壓力測試</td>
                            <td class="py-4 text-right">
                                <span class="bg-green-100 text-green-700 px-3 py-1 rounded-md text-xs font-bold">已核准</span>
                            </td>
                        </tr>
                        <tr>
                            <td class="py-4">2024-03-15</td>
                            <td class="py-4">18:00 - 20:00</td>
                            <td class="py-4 font-semibold text-blue-600">2.0h</td>
                            <td class="py-4">例行性伺服器維護</td>
                            <td class="py-4 text-right">
                                <span class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-md text-xs font-bold">審核中</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <p class="text-center text-slate-400 text-sm mt-8 mb-10">
            © 2024 企業人力資源管理系統 | 加寬排版版本 v2.0
        </p>
    </div>

    <!-- 模擬通知彈窗 -->
    <div id="toast" class="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl opacity-0 transition-opacity duration-300 pointer-events-none">
        申請已成功提交！
    </div>

    <script>
        function submitForm() {
            const toast = document.getElementById('toast');
            toast.style.opacity = '1';
            
            setTimeout(() => {
                toast.style.opacity = '0';
            }, 3000);

            console.log("加班申請已提交");
        }
    </script>
</body>
</html>