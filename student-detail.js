let currentStudentName = '';
let allRecords = [];

// 初始化页面
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    currentStudentName = urlParams.get('student') || '';
    
    if (!currentStudentName) {
        alert('⚠️ 未指定学生');
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('studentName').textContent = currentStudentName;
    loadRecords();
};

// 加载记录
function loadRecords() {
    const recordsData = localStorage.getItem(`student_${currentStudentName}_records`);
    if (recordsData) {
        try {
            allRecords = JSON.parse(recordsData);
        } catch (e) {
            console.error('加载数据失败:', e);
            allRecords = [];
        }
    } else {
        allRecords = [];
    }
    
    // 按日期排序，最近的在前
    allRecords.sort((a, b) => new Date(b.date1) - new Date(a.date1));
    
    displayRecords(allRecords);
}

// 显示记录
function displayRecords(records) {
    const container = document.getElementById('recordsList');
    
    if (records.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <h3>还没有任务表记录</h3>
                <p>点击右上角"创建新任务表"开始</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    records.forEach((record, index) => {
        const card = createRecordCard(record, index);
        container.appendChild(card);
    });
}

// 创建记录卡片
function createRecordCard(record, index) {
    const card = document.createElement('div');
    card.className = 'record-card';
    
    const date = new Date(record.date1);
    const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
    const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
    
    const taskCount = record.tasks ? record.tasks.length : 0;
    const planCount = record.plans ? record.plans.length : 0;
    
    // 计算完成情况
    let completedTasks = 0;
    let incompleteTasks = 0;
    if (record.tasks) {
        record.tasks.forEach(task => {
            if (task.statusType === 'complete' || task.statusType === 'super') {
                completedTasks++;
            } else if (task.statusType === 'incomplete') {
                incompleteTasks++;
            }
        });
    }
    
    const lastModified = record.lastModified ? new Date(record.lastModified).toLocaleString('zh-CN') : '未知';
    
    card.innerHTML = `
        <div class="record-header">
            <div class="record-date">📅 ${record.date1} (${dateStr} ${weekday})</div>
            <div class="record-actions">
                <button class="btn-edit" onclick="editRecord('${record.date1}', event)">✏️ 编辑</button>
                <button class="btn-export" onclick="exportRecord('${record.date1}', event)">📥 导出</button>
                <button class="btn-delete" onclick="deleteRecord('${record.date1}', event)">🗑️ 删除</button>
            </div>
        </div>
        
        <div class="record-summary">
            <div class="summary-text">
                <strong>📚 今日课程：</strong>${record.todayClass || '未填写'}<br>
                <strong>🕐 到/离校：</strong>${record.schoolTime || '未填写'}<br>
                <strong>📊 完成情况：</strong>
                ${completedTasks > 0 ? `<span style="color: #28a745;">✓ 完成 ${completedTasks} 项</span>` : ''}
                ${incompleteTasks > 0 ? `<span style="color: #ff0000; margin-left: 10px;">✗ 未完成 ${incompleteTasks} 项</span>` : ''}
                ${completedTasks === 0 && incompleteTasks === 0 ? '暂无数据' : ''}
            </div>
        </div>
        
        <div class="record-info">
            <div class="info-item">
                <span class="info-label">当日任务数</span>
                <span class="info-value">${taskCount} 项</span>
            </div>
            <div class="info-item">
                <span class="info-label">次日计划数</span>
                <span class="info-value">${planCount} 项</span>
            </div>
            <div class="info-item">
                <span class="info-label">最后修改</span>
                <span class="info-value" style="font-size: 12px;">${lastModified}</span>
            </div>
        </div>
    `;
    
    return card;
}

// 筛选记录
function filterRecords() {
    const keyword = document.getElementById('searchKeyword').value.toLowerCase();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    let filtered = allRecords.filter(record => {
        // 关键词搜索
        if (keyword) {
            const searchText = `${record.todayClass || ''} ${record.schoolTime || ''} ${JSON.stringify(record.tasks || [])} ${JSON.stringify(record.plans || [])}`.toLowerCase();
            if (!searchText.includes(keyword)) {
                return false;
            }
        }
        
        // 日期筛选
        if (startDate && record.date1 < startDate) {
            return false;
        }
        if (endDate && record.date1 > endDate) {
            return false;
        }
        
        return true;
    });
    
    displayRecords(filtered);
}

// 创建新记录
function createNewRecord() {
    window.location.href = `editor.html?student=${encodeURIComponent(currentStudentName)}`;
}

// 编辑记录
function editRecord(date, event) {
    event.stopPropagation();
    window.location.href = `editor.html?student=${encodeURIComponent(currentStudentName)}&date=${date}`;
}

// 导出记录
async function exportRecord(date, event) {
    event.stopPropagation();
    
    const record = allRecords.find(r => r.date1 === date);
    if (!record) {
        alert('❌ 找不到记录');
        return;
    }
    
    // 创建临时预览容器
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.padding = '40px';
    tempDiv.style.background = '#f8f9fa';
    document.body.appendChild(tempDiv);
    
    // 生成表格HTML
    tempDiv.innerHTML = generateTableHTML(record);
    
    try {
        const canvas = await html2canvas(tempDiv, {
            scale: 4,
            backgroundColor: '#f8f9fa',
            logging: false,
            useCORS: true,
            allowTaint: true
        });
        
        const link = document.createElement('a');
        const dateObj = new Date(date);
        const dateStr = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
        link.download = `${currentStudentName}_${dateStr}任务表.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        
        alert('✅ 图片导出成功！');
    } catch (error) {
        console.error('导出失败:', error);
        alert('❌ 导出失败，请重试！');
    } finally {
        document.body.removeChild(tempDiv);
    }
}

// 生成表格HTML
function generateTableHTML(record) {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    };
    
    let html = `
        <table class="student-table" style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 17px; background: white; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12); border-radius: 12px; overflow: hidden; margin-bottom: 40px; table-layout: fixed; box-sizing: border-box;">
            <colgroup>
                <col style="width: 20%; box-sizing: border-box;">
                <col style="width: 20%; box-sizing: border-box;">
                <col style="width: 20%; box-sizing: border-box;">
                <col style="width: 20%; box-sizing: border-box;">
                <col style="width: 20%; box-sizing: border-box;">
            </colgroup>
            <tr>
                <th colspan="5" style="background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; font-size: 26px; font-weight: 800; padding: 22px 20px; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2); border: none; box-sizing: border-box;">${formatDate(record.date1)}学生任务表</th>
            </tr>
            <tr>
                <td style="background: linear-gradient(135deg, #ffe4d1 0%, #ffd4b3 100%); color: #2c3e50; font-weight: 700; font-size: 16px; border-left: 4px solid #ff8c42; padding: 16px 14px; text-align: center; line-height: 1.6; border: 1px solid #e8e8e8; box-sizing: border-box;">到/离校时间</td>
                <td colspan="4" style="background: linear-gradient(135deg, #ffe4d1 0%, #ffd4b3 100%); color: #2c3e50; font-weight: 600; font-size: 16px; padding: 16px 14px; text-align: center; line-height: 1.6; border: 1px solid #e8e8e8; box-sizing: border-box;">${record.schoolTime || ''}</td>
            </tr>
            <tr>
                <td style="background: linear-gradient(135deg, #ffe4d1 0%, #ffd4b3 100%); color: #2c3e50; font-weight: 700; font-size: 16px; border-left: 4px solid #ff8c42; padding: 16px 14px; text-align: center; line-height: 1.6; border: 1px solid #e8e8e8; box-sizing: border-box;">今日课程</td>
                <td colspan="4" style="background: linear-gradient(135deg, #ffe4d1 0%, #ffd4b3 100%); color: #2c3e50; font-weight: 600; font-size: 16px; padding: 16px 14px; text-align: center; line-height: 1.6; border: 1px solid #e8e8e8; box-sizing: border-box;">${record.todayClass || ''}</td>
            </tr>
            <tr style="background: linear-gradient(135deg, #ffd4e5 0%, #ffc4d6 100%);">
                <td style="color: #2c3e50; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; padding: 16px 14px; text-align: center; border: 1px solid #e8e8e8; box-sizing: border-box;">学生姓名</td>
                <td style="color: #2c3e50; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; padding: 16px 14px; text-align: center; border: 1px solid #e8e8e8; box-sizing: border-box;">规定时间</td>
                <td style="color: #2c3e50; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; padding: 16px 14px; text-align: center; border: 1px solid #e8e8e8; box-sizing: border-box;">学习安排</td>
                <td style="color: #2c3e50; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; padding: 16px 14px; text-align: center; border: 1px solid #e8e8e8; box-sizing: border-box;">实际时间</td>
                <td style="color: #2c3e50; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; padding: 16px 14px; text-align: center; border: 1px solid #e8e8e8; box-sizing: border-box;">完成情况</td>
            </tr>
    `;
    
    const tasks = record.tasks || [];
    const studentRowSpan = tasks.length || 1;
    
    tasks.forEach((task, index) => {
        if (task.statusType === 'lunch') {
            html += `
                <tr>
                    ${index === 0 ? `<td rowspan="${studentRowSpan}" style="background: linear-gradient(135deg, #fff9e6 0%, #fff4cc 100%); font-weight: 800; font-size: 20px; color: #2c3e50; border-right: 3px solid #ff8c42; letter-spacing: 1px; padding: 16px 14px; text-align: center; border: 1px solid #e8e8e8; box-sizing: border-box;">${currentStudentName}</td>` : ''}
                    <td colspan="4" style="background: linear-gradient(135deg, #fff3e6 0%, #ffe8cc 100%); font-weight: 700; font-size: 17px; color: #e67e22; border-left: 5px solid #ff8c42; border-right: 5px solid #ff8c42; letter-spacing: 1px; padding: 16px 14px; text-align: center; border: 1px solid #e8e8e8; box-sizing: border-box;">${task.content}</td>
                </tr>
            `;
        } else {
            let statusStyle = '';
            if (task.statusType === 'complete') {
                statusStyle = 'color: #27ae60; font-weight: 800; font-size: 17px;';
            } else if (task.statusType === 'super') {
                statusStyle = 'color: #e74c3c; font-weight: 800; font-size: 17px;';
            } else if (task.statusType === 'incomplete') {
                statusStyle = 'color: #ff0000; font-weight: 800; font-size: 17px; background: #ffe6e6; padding: 4px 8px; border-radius: 4px; border: 2px solid #ff0000;';
            }
            
            html += `
                <tr>
                    ${index === 0 ? `<td rowspan="${studentRowSpan}" style="background: linear-gradient(135deg, #fff9e6 0%, #fff4cc 100%); font-weight: 800; font-size: 20px; color: #2c3e50; border-right: 3px solid #ff8c42; letter-spacing: 1px; padding: 16px 14px; text-align: center; border: 1px solid #e8e8e8; box-sizing: border-box;">${currentStudentName}</td>` : ''}
                    <td style="background: #fffbf0; color: #2c3e50; font-size: 16px; padding: 16px 14px; text-align: center; border: 1px solid #e8e8e8; box-sizing: border-box;">${task.duration}</td>
                    <td style="background: #fffbf0; color: #2c3e50; font-size: 16px; padding: 16px 14px; text-align: center; border: 1px solid #e8e8e8; box-sizing: border-box;">${task.content}</td>
                    <td style="background: #fffbf0; color: #2c3e50; font-size: 16px; padding: 16px 14px; text-align: center; border: 1px solid #e8e8e8; box-sizing: border-box;">${task.actualTime}</td>
                    <td style="background: #fffbf0; color: #2c3e50; font-size: 16px; padding: 16px 14px; text-align: center; border: 1px solid #e8e8e8; ${statusStyle} box-sizing: border-box;">${task.status}</td>
                </tr>
            `;
        }
    });
    
    html += `</table>`;
    
    // 第二个表格：次日计划
    const plans = record.plans || [];
    if (plans.length > 0) {
        html += `
            <table class="student-table" style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 17px; background: white; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12); border-radius: 12px; overflow: hidden; table-layout: fixed; box-sizing: border-box;">
                <colgroup>
                    <col style="width: 20%; box-sizing: border-box;">
                    <col style="width: 20%; box-sizing: border-box;">
                    <col style="width: 20%; box-sizing: border-box;">
                    <col style="width: 40%; box-sizing: border-box;">
                </colgroup>
                <tr>
                    <th colspan="4" style="background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; font-size: 26px; font-weight: 800; padding: 22px 20px; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2); border: none; box-sizing: border-box;">${formatDate(record.date2)}学习任务计划</th>
                </tr>
                <tr style="background: linear-gradient(135deg, #ffd4e5 0%, #ffc4d6 100%);">
                    <td style="color: #2c3e50; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; padding: 16px 14px; text-align: center; border: 1px solid #e8e8e8; box-sizing: border-box;">学生姓名</td>
                    <td style="color: #2c3e50; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; padding: 16px 14px; text-align: center; border: 1px solid #e8e8e8; box-sizing: border-box;">任务内容</td>
                    <td style="color: #2c3e50; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; padding: 16px 14px; text-align: center; border: 1px solid #e8e8e8; box-sizing: border-box;">规定时长</td>
                    <td style="color: #2c3e50; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; padding: 16px 14px; text-align: center; border: 1px solid #e8e8e8; box-sizing: border-box;">备注</td>
                </tr>
        `;
        
        const planRowSpan = plans.length;
        plans.forEach((plan, index) => {
            html += `
                <tr>
                    ${index === 0 ? `<td rowspan="${planRowSpan}" style="background: linear-gradient(135deg, #fff9e6 0%, #fff4cc 100%); font-weight: 800; font-size: 20px; color: #2c3e50; border-right: 3px solid #ff8c42; letter-spacing: 1px; padding: 16px 14px; text-align: center; border: 1px solid #e8e8e8; box-sizing: border-box;">${currentStudentName}</td>` : ''}
                    <td style="background: #fffbf0; color: #2c3e50; font-size: 16px; padding: 16px 14px; text-align: center; border: 1px solid #e8e8e8; box-sizing: border-box;">${plan.content}</td>
                    <td style="background: #fffbf0; color: #2c3e50; font-size: 16px; padding: 16px 14px; text-align: center; border: 1px solid #e8e8e8; box-sizing: border-box;">${plan.duration}</td>
                    <td style="background: #fffbf0; color: #2c3e50; font-size: 16px; padding: 16px 14px; text-align: center; border: 1px solid #e8e8e8; box-sizing: border-box;">${plan.note}</td>
                </tr>
            `;
        });
        
        html += `</table>`;
    }
    
    return html;
}

// 删除记录
function deleteRecord(date, event) {
    event.stopPropagation();
    
    if (!confirm(`确定要删除 ${date} 的任务表吗？\n此操作不可恢复！`)) {
        return;
    }
    
    allRecords = allRecords.filter(r => r.date1 !== date);
    localStorage.setItem(`student_${currentStudentName}_records`, JSON.stringify(allRecords));
    
    loadRecords();
    alert('✅ 删除成功');
}

// 返回
function goBack() {
    window.location.href = 'index.html';
}
