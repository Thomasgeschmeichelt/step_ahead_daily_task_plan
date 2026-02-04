// 任务数据
let tasks = [
    { duration: '55mins', content: '化学竞赛作业', actualTime: '9:35-10:40', status: '超时完成✓', statusType: 'super' },
    { duration: '2H', content: '化学ukcho课', actualTime: '10:30-12:30', status: '完成✓', statusType: 'complete' },
    { duration: 'lunch', content: '12:30-14:00午休', actualTime: '', status: '', statusType: '' },
    { duration: '1H45mins', content: '化学学科作业', actualTime: '14:05-15:50', status: '未完成', statusType: 'incomplete' },
    { duration: '25mins', content: '雅思单词list11(75词)', actualTime: '16:10-16:35', status: '准确率96%✓', statusType: 'complete' },
    { duration: '1H20mins', content: '学校化学作业', actualTime: '16:40-18:00', status: '完成✓', statusType: 'complete' }
];

// 计划数据
let plans = [
    { content: 'EDX数学P1', duration: '2H', note: '10:00-12:00' },
    { content: '雅思单词list11(75词)', duration: '1H', note: '准确率>95%' },
    { content: 'EDX数学P1课后作业', duration: '1.5H', note: '' },
    { content: '化学学科作业', duration: '1H', note: '12.14日遗留' },
    { content: '数学错题订正', duration: '0.5H', note: '' }
];

// 初始化页面
window.onload = function() {
    loadInitialData();
    updatePreview();
};

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
            <input type="text" value="${task.duration}" onchange="updateTaskField(${index}, 'duration', this.value)">
            
            <label>学习安排：</label>
            <input type="text" value="${task.content}" onchange="updateTaskField(${index}, 'content', this.value)">
            
            <label>实际时间：</label>
            <input type="text" value="${task.actualTime}" onchange="updateTaskField(${index}, 'actualTime', this.value)">
            
            <label>完成情况：</label>
            <input type="text" value="${task.status}" onchange="updateTaskField(${index}, 'status', this.value)">
            
            <label>状态类型：</label>
            <select onchange="updateTaskField(${index}, 'statusType', this.value)">
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
            <input type="text" value="${plan.content}" onchange="updatePlanField(${index}, 'content', this.value)">
            
            <label>规定时长：</label>
            <input type="text" value="${plan.duration}" onchange="updatePlanField(${index}, 'duration', this.value)">
            
            <label>备注：</label>
            <input type="text" value="${plan.note}" onchange="updatePlanField(${index}, 'note', this.value)">
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
        <table class="student-table">
            <tr>
                <th colspan="5" class="header-orange">${formatDate(date1)}学生任务表</th>
            </tr>
            <tr>
                <td colspan="5" class="header-peach">到/离校时间</td>
            </tr>
            <tr>
                <td colspan="5" class="header-peach">${schoolTime}</td>
            </tr>
            <tr>
                <td colspan="5" class="header-peach">今日课程</td>
            </tr>
            <tr>
                <td colspan="5" class="header-peach">${todayClass}</td>
            </tr>
            <tr class="header-pink">
                <td>学生姓名</td>
                <td>规定时间</td>
                <td>学习安排</td>
                <td>实际时间</td>
                <td>完成情况</td>
            </tr>
    `;
    
    // 计算学生姓名单元格应该跨越的行数
    const studentRowSpan = tasks.length;
    
    tasks.forEach((task, index) => {
        if (task.statusType === 'lunch') {
            // 午休行特殊处理
            html += `
                <tr>
                    ${index === 0 ? `<td rowspan="${studentRowSpan}" class="student-name-cell">${studentName1}</td>` : ''}
                    <td colspan="4" class="cell-lunch">${task.content}</td>
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
                    ${index === 0 ? `<td rowspan="${studentRowSpan}" class="student-name-cell">${studentName1}</td>` : ''}
                    <td class="cell-yellow">${task.duration}</td>
                    <td class="cell-yellow">${task.content}</td>
                    <td class="cell-yellow">${task.actualTime}</td>
                    <td class="cell-yellow ${statusClass}">${task.status}</td>
                </tr>
            `;
        }
    });
    
    html += `</table>`;
    
    // 第二个表格：次日计划
    html += `
        <table class="student-table">
            <tr>
                <th colspan="4" class="header-orange">${formatDate(date2)}学习任务计划</th>
            </tr>
            <tr class="header-pink">
                <td>学生姓名</td>
                <td>任务内容</td>
                <td>规定时长</td>
                <td>备注</td>
            </tr>
    `;
    
    const planRowSpan = plans.length;
    
    plans.forEach((plan, index) => {
        html += `
            <tr>
                ${index === 0 ? `<td rowspan="${planRowSpan}" class="student-name-cell">${studentName2}</td>` : ''}
                <td class="cell-yellow">${plan.content}</td>
                <td class="cell-yellow">${plan.duration}</td>
                <td class="cell-yellow">${plan.note}</td>
            </tr>
        `;
    });
    
    html += `</table>`;
    
    document.getElementById('preview').innerHTML = html;
}

// 导出为PNG
async function exportToPNG() {
    const preview = document.getElementById('preview');
    
    // 显示加载提示
    const originalContent = preview.innerHTML;
    
    try {
        // 使用html2canvas生成高清图片
        const canvas = await html2canvas(preview, {
            scale: 4, // 提高清晰度到4倍分辨率，更高清
            backgroundColor: '#f8f9fa',
            logging: false,
            useCORS: true,
            allowTaint: true,
            imageTimeout: 0,
            removeContainer: true,
            scrollY: -window.scrollY,
            scrollX: -window.scrollX,
            windowWidth: preview.scrollWidth,
            windowHeight: preview.scrollHeight
        });
        
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
        alert('❌ 导出失败，请重试！');
    }
}

