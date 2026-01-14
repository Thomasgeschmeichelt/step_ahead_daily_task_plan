// 当前学生姓名
let currentStudentName = '';
// 当前编辑的日期
let currentDate = '';

// 任务数据
let tasks = [];

// 计划数据
let plans = [];

// 初始化页面
window.onload = function() {
    // 从URL获取学生姓名和日期
    const urlParams = new URLSearchParams(window.location.search);
    currentStudentName = urlParams.get('student') || '';
    currentDate = urlParams.get('date') || '';
    
    if (!currentStudentName) {
        alert('⚠️ 未指定学生，返回首页');
        window.location.href = 'index.html';
        return;
    }
    
    // 显示当前学生
    document.getElementById('currentStudent').innerHTML = `<strong>当前学生：${currentStudentName}</strong>`;
    document.getElementById('studentName1').value = currentStudentName;
    
    // 设置日期为今天
    setTodayDate();
    
    // 加载保存的数据
    const hasData = loadSavedData();
    
    // 如果没有保存的数据，初始化为空（不加载示例数据）
    if (!hasData) {
        tasks = [];
        plans = [];
    }
    
    loadInitialData();
    updatePreview();
};

// 切换折叠区域
function toggleSection(sectionId) {
    const content = document.getElementById(sectionId);
    const iconId = sectionId.replace('section', 'icon');
    const icon = document.getElementById(iconId);
    
    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        icon.classList.remove('collapsed');
    } else {
        content.classList.add('collapsed');
        icon.classList.add('collapsed');
    }
}

// 加载默认数据
function loadDefaultData() {
    tasks = [
        { duration: '55mins', content: '化学竞赛作业', actualTime: '9:35-10:40', status: '超时完成✓', statusType: 'super' },
        { duration: '2H', content: '化学ukcho课', actualTime: '10:30-12:30', status: '完成✓', statusType: 'complete' },
        { duration: 'lunch', content: '12:30-14:00午休', actualTime: '', status: '', statusType: 'lunch' },
        { duration: '1H45mins', content: '化学学科作业', actualTime: '14:05-15:50', status: '未完成', statusType: 'incomplete' },
        { duration: '25mins', content: '雅思单词list11(75词)', actualTime: '16:10-16:35', status: '准确率96%✓', statusType: 'complete' },
        { duration: '1H20mins', content: '学校化学作业', actualTime: '16:40-18:00', status: '完成✓', statusType: 'complete' }
    ];
    
    plans = [
        { content: 'EDX数学P1', duration: '2H', note: '10:00-12:00' },
        { content: '雅思单词list11(75词)', duration: '1H', note: '准确率>95%' },
        { content: 'EDX数学P1课后作业', duration: '1.5H', note: '' },
        { content: '化学学科作业', duration: '1H', note: '12.14日遗留' },
        { content: '数学错题订正', duration: '0.5H', note: '' }
    ];
}

// 设置今天的日期
function setTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    // 如果指定了日期，使用指定的日期，否则使用今天
    if (!currentDate) {
        document.getElementById('date1').value = todayStr;
    }
    
    // 次日日期设置为明天
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowYear = tomorrow.getFullYear();
    const tomorrowMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const tomorrowDay = String(tomorrow.getDate()).padStart(2, '0');
    const tomorrowStr = `${tomorrowYear}-${tomorrowMonth}-${tomorrowDay}`;
    
    if (!currentDate) {
        document.getElementById('date2').value = tomorrowStr;
    }
}

// 加载保存的数据
function loadSavedData() {
    // 如果指定了日期，从records中加载对应日期的数据
    if (currentDate) {
        const recordsData = localStorage.getItem(`student_${currentStudentName}_records`);
        if (recordsData) {
            try {
                const records = JSON.parse(recordsData);
                const record = records.find(r => r.date1 === currentDate);
                
                if (record) {
                    // 恢复表单数据
                    document.getElementById('date1').value = record.date1;
                    document.getElementById('schoolTime').value = record.schoolTime || '';
                    document.getElementById('todayClass').value = record.todayClass || '';
                    document.getElementById('date2').value = record.date2 || '';
                    
                    // 恢复任务和计划
                    tasks = record.tasks || [];
                    plans = record.plans || [];
                    
                    console.log('✅ 数据加载成功');
                    return true;
                }
            } catch (e) {
                console.error('❌ 数据加载失败:', e);
            }
        }
    }
    return false;
}

// 保存数据
function saveData() {
    const date1 = document.getElementById('date1').value;
    
    if (!date1) {
        alert('⚠️ 请选择日期');
        return;
    }
    
    const recordData = {
        date1: date1,
        schoolTime: document.getElementById('schoolTime').value,
        todayClass: document.getElementById('todayClass').value,
        date2: document.getElementById('date2').value,
        tasks: tasks,
        plans: plans,
        lastModified: new Date().toISOString()
    };
    
    // 获取现有记录
    const recordsData = localStorage.getItem(`student_${currentStudentName}_records`);
    let records = [];
    if (recordsData) {
        try {
            records = JSON.parse(recordsData);
        } catch (e) {
            console.error('解析记录失败:', e);
        }
    }
    
    // 查找是否已存在该日期的记录
    const existingIndex = records.findIndex(r => r.date1 === date1);
    if (existingIndex >= 0) {
        // 更新现有记录
        records[existingIndex] = recordData;
    } else {
        // 添加新记录
        records.push(recordData);
    }
    
    // 保存记录
    localStorage.setItem(`student_${currentStudentName}_records`, JSON.stringify(records));
    
    // 更新学生列表
    updateStudentList();
    
    alert('✅ 数据已保存！');
    
    // 更新当前日期
    currentDate = date1;
}

// 更新学生列表
function updateStudentList() {
    let studentList = JSON.parse(localStorage.getItem('studentList') || '[]');
    
    if (!studentList.includes(currentStudentName)) {
        studentList.push(currentStudentName);
        localStorage.setItem('studentList', JSON.stringify(studentList));
    }
}

// 返回学生详情页
function goBack() {
    if (confirm('是否保存当前数据后返回？')) {
        saveData();
    }
    window.location.href = `student-detail.html?student=${encodeURIComponent(currentStudentName)}`;
}

// 加载初始数据
function loadInitialData() {
    const taskListDiv = document.getElementById('taskList');
    taskListDiv.innerHTML = '';
    
    tasks.forEach((task, index) => {
        addTaskToDOM(task, index);
    });
    
    const planListDiv = document.getElementById('planList');
    planListDiv.innerHTML = '';
    
    plans.forEach((plan, index) => {
        addPlanToDOM(plan, index);
    });
}

// 添加任务到DOM
function addTaskToDOM(task, index) {
    const taskListDiv = document.getElementById('taskList');
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-item';
    taskDiv.innerHTML = `
        <div class="task-item-header">
            <strong>任务 ${index + 1}</strong>
            <button onclick="removeTask(${index})" class="btn-remove">删除</button>
        </div>
        <div class="task-inputs">
            <label>规定时间：</label>
            <input type="text" value="${task.duration}" placeholder="例如：1小时30分钟" oninput="updateTaskField(${index}, 'duration', this.value); updatePreview();">
            
            <label>学习安排：</label>
            <textarea rows="2" placeholder="例如：EDX数学P2课程，雅思单词背诵50个，午休12:00～14:00&#10;（按Enter键换行）" oninput="updateTaskField(${index}, 'content', this.value); updatePreview();">${task.content}</textarea>
            
            <label>实际时间：</label>
            <input type="text" value="${task.actualTime}" placeholder="例如：10:00~11:30" oninput="updateTaskField(${index}, 'actualTime', this.value); updatePreview();">
            
            <label>完成情况：</label>
            <textarea rows="2" placeholder="例如：完成，正确率100%；超时完成，正确率95%；未完成&#10;（按Enter键换行）" oninput="updateTaskField(${index}, 'status', this.value); updatePreview();">${task.status}</textarea>
            
            <label>状态类型：</label>
            <select onchange="updateTaskField(${index}, 'statusType', this.value); updatePreview();">
                <option value="" ${task.statusType === '' ? 'selected' : ''}>无</option>
                <option value="complete" ${task.statusType === 'complete' ? 'selected' : ''}>完成</option>
                <option value="super" ${task.statusType === 'super' ? 'selected' : ''}>超时完成</option>
                <option value="incomplete" ${task.statusType === 'incomplete' ? 'selected' : ''}>未完成</option>
                <option value="lunch" ${task.statusType === 'lunch' ? 'selected' : ''}>午休</option>
            </select>
        </div>
    `;
    taskListDiv.appendChild(taskDiv);
}

// 添加计划到DOM
function addPlanToDOM(plan, index) {
    const planListDiv = document.getElementById('planList');
    const planDiv = document.createElement('div');
    planDiv.className = 'plan-item';
    planDiv.innerHTML = `
        <div class="plan-item-header">
            <strong>计划 ${index + 1}</strong>
            <button onclick="removePlan(${index})" class="btn-remove">删除</button>
        </div>
        <div class="plan-inputs">
            <label>任务内容：</label>
            <textarea rows="2" placeholder="例如：EDX数学P2课程，雅思单词背诵50个，午休12:00～14:00&#10;（按Enter键换行）" oninput="updatePlanField(${index}, 'content', this.value); updatePreview();">${plan.content}</textarea>
            
            <label>规定时长：</label>
            <input type="text" value="${plan.duration}" placeholder="例如：1小时30分钟" oninput="updatePlanField(${index}, 'duration', this.value); updatePreview();">
            
            <label>备注：</label>
            <textarea rows="2" placeholder="例如：昨日任务遗留，10:00~12:00，正确率>95%&#10;（按Enter键换行）" oninput="updatePlanField(${index}, 'note', this.value); updatePreview();">${plan.note}</textarea>
        </div>
    `;
    planListDiv.appendChild(planDiv);
}

// 更新任务字段
function updateTaskField(index, field, value) {
    tasks[index][field] = value;
}

// 更新计划字段
function updatePlanField(index, field, value) {
    plans[index][field] = value;
}

// 添加新任务
function addTask() {
    const newTask = {
        duration: '',
        content: '',
        actualTime: '',
        status: '',
        statusType: ''
    };
    tasks.push(newTask);
    addTaskToDOM(newTask, tasks.length - 1);
}

// 添加新计划
function addPlan() {
    const newPlan = {
        content: '',
        duration: '',
        note: ''
    };
    plans.push(newPlan);
    addPlanToDOM(newPlan, plans.length - 1);
}

// 删除任务
function removeTask(index) {
    tasks.splice(index, 1);
    loadInitialData();
    updatePreview();
}

// 删除计划
function removePlan(index) {
    plans.splice(index, 1);
    loadInitialData();
    updatePreview();
}

// 转义HTML特殊字符但保留换行符
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
}

// 更新预览
function updatePreview() {
    const date1 = document.getElementById('date1').value;
    const schoolTime = document.getElementById('schoolTime').value;
    const todayClass = document.getElementById('todayClass').value;
    const studentName1 = document.getElementById('studentName1').value;
    
    const date2 = document.getElementById('date2').value;
    // 次日计划使用相同的学生姓名
    const studentName2 = studentName1;
    
    let html = `
        <!-- 第一个表格：当日任务 -->
        <table class="student-table" style="table-layout: fixed; width: 100%; box-sizing: border-box;">
            <colgroup>
                <col style="width: 20%; box-sizing: border-box;">
                <col style="width: 20%; box-sizing: border-box;">
                <col style="width: 20%; box-sizing: border-box;">
                <col style="width: 20%; box-sizing: border-box;">
                <col style="width: 20%; box-sizing: border-box;">
            </colgroup>
            <tr>
                <th colspan="5" class="header-orange">${formatDate(date1)}学生任务表</th>
            </tr>
            <tr>
                <td class="header-peach" style="box-sizing: border-box;">到/离校时间</td>
                <td colspan="4" class="header-peach" style="box-sizing: border-box;">${escapeHtml(schoolTime)}</td>
            </tr>
            <tr>
                <td class="header-peach" style="box-sizing: border-box;">今日课程</td>
                <td colspan="4" class="header-peach" style="box-sizing: border-box;">${escapeHtml(todayClass)}</td>
            </tr>
            <tr class="header-pink">
                <td style="box-sizing: border-box;">学生姓名</td>
                <td style="box-sizing: border-box;">规定时间</td>
                <td style="box-sizing: border-box;">学习安排</td>
                <td style="box-sizing: border-box;">实际时间</td>
                <td style="box-sizing: border-box;">完成情况</td>
            </tr>
    `;
    
    // 计算学生姓名单元格应该跨越的行数
    const studentRowSpan = tasks.length;
    
    tasks.forEach((task, index) => {
        if (task.statusType === 'lunch') {
            // 午休行特殊处理
            html += `
                <tr>
                    ${index === 0 ? `<td rowspan="${studentRowSpan}" class="student-name-cell" style="box-sizing: border-box;">${escapeHtml(studentName1)}</td>` : ''}
                    <td colspan="4" class="cell-lunch" style="box-sizing: border-box;">${escapeHtml(task.content)}</td>
                </tr>
            `;
        } else {
            // 普通任务行
            let statusClass = '';
            if (task.statusType === 'complete') statusClass = 'status-complete';
            else if (task.statusType === 'super') statusClass = 'status-super-complete';
            else if (task.statusType === 'incomplete') statusClass = 'status-incomplete';
            
            html += `
                <tr>
                    ${index === 0 ? `<td rowspan="${studentRowSpan}" class="student-name-cell" style="box-sizing: border-box;">${escapeHtml(studentName1)}</td>` : ''}
                    <td class="cell-yellow" style="box-sizing: border-box;">${escapeHtml(task.duration)}</td>
                    <td class="cell-yellow" style="box-sizing: border-box;">${escapeHtml(task.content)}</td>
                    <td class="cell-yellow" style="box-sizing: border-box;">${escapeHtml(task.actualTime)}</td>
                    <td class="cell-yellow ${statusClass}" style="box-sizing: border-box;">${escapeHtml(task.status)}</td>
                </tr>
            `;
        }
    });
    
    html += `</table>`;
    
    // 第二个表格：次日计划（仅当有计划时显示）
    if (plans.length > 0) {
        html += `
            <table class="student-table" style="table-layout: fixed; width: 100%; box-sizing: border-box;">
                <colgroup>
                    <col style="width: 20%; box-sizing: border-box;">
                    <col style="width: 20%; box-sizing: border-box;">
                    <col style="width: 20%; box-sizing: border-box;">
                    <col style="width: 40%; box-sizing: border-box;">
                </colgroup>
                <tr>
                    <th colspan="4" class="header-orange">${formatDate(date2)}学习任务计划</th>
                </tr>
                <tr class="header-pink">
                    <td style="box-sizing: border-box;">学生姓名</td>
                    <td style="box-sizing: border-box;">任务内容</td>
                    <td style="box-sizing: border-box;">规定时长</td>
                    <td style="box-sizing: border-box;">备注</td>
                </tr>
        `;
        
        const planRowSpan = plans.length;
        
        plans.forEach((plan, index) => {
            html += `
                <tr>
                    ${index === 0 ? `<td rowspan="${planRowSpan}" class="student-name-cell" style="box-sizing: border-box;">${escapeHtml(studentName2)}</td>` : ''}
                    <td class="cell-yellow" style="box-sizing: border-box;">${escapeHtml(plan.content)}</td>
                    <td class="cell-yellow" style="box-sizing: border-box;">${escapeHtml(plan.duration)}</td>
                    <td class="cell-yellow" style="box-sizing: border-box;">${escapeHtml(plan.note)}</td>
                </tr>
            `;
        });
        
        html += `</table>`;
    }
    
    document.getElementById('preview').innerHTML = html;
}

// 导出为PNG
async function exportToPNG() {
    const preview = document.getElementById('preview');
    
    // 创建一个临时容器，确保生成图片时的尺寸和预览一致
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: ${preview.offsetWidth}px;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        padding: 40px;
        box-sizing: border-box;
    `;
    tempContainer.innerHTML = preview.innerHTML;
    document.body.appendChild(tempContainer);
    
    try {
        // 使用html2canvas生成高清图片，使用固定宽度确保布局一致
        const canvas = await html2canvas(tempContainer, {
            scale: 4, // 提高清晰度到4倍分辨率
            backgroundColor: '#f8f9fa',
            logging: false,
            useCORS: true,
            allowTaint: true,
            imageTimeout: 0,
            removeContainer: false,
            width: preview.offsetWidth,
            windowWidth: preview.offsetWidth
        });
        
        // 移除临时容器
        document.body.removeChild(tempContainer);
        
        // 转换为PNG并下载（最高质量）
        const link = document.createElement('a');
        const date1 = document.getElementById('date1').value;
        const studentName = document.getElementById('studentName1').value;
        link.download = `${studentName}_${formatDate(date1)}任务表_高清版.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        
        alert('✅ 高清图片导出成功！（4倍分辨率）');
    } catch (error) {
        console.error('导出失败:', error);
        // 确保移除临时容器
        if (tempContainer.parentNode) {
            document.body.removeChild(tempContainer);
        }
        alert('❌ 导出失败，请重试！');
    }
}
