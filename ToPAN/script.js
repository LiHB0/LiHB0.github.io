document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('imageInput');
    const uploadedImage = document.getElementById('uploadedImage');
    const imageContainer = document.querySelector('.image-container');
    const marksList = document.getElementById('marksList');
    const clearMarksButton = document.getElementById('clearMarks');
    const markColor = document.getElementById('markColor');
    const markSize = document.getElementById('markSize');
    const sizeValue = document.getElementById('sizeValue');
    const marksCounter = document.getElementById('marksCounter');
    const uploadArea = document.getElementById('uploadArea');
    const saveMarksButton = document.getElementById('saveMarks');
    const loadMarksInput = document.getElementById('loadMarks');
    let imageFileName = '';

    let marks = [];

    // 更新大小显示
    markSize.addEventListener('input', function() {
        sizeValue.textContent = this.value + 'px';
    });

    // 处理拖拽事件
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                handleImageUpload(file);
            } else {
                alert('请上传图片文件！');
            }
        }
    });

    // 处理文件输入
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file);
        }
    });

    // 统一处理图片上传
    function handleImageUpload(file) {
        imageFileName = file.name;
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImage.src = e.target.result;
            uploadedImage.style.display = 'inline-block';
            document.getElementById('defaultImage').style.display = 'none';
        }
        reader.readAsDataURL(file);
        clearMarks();
    }

    // 处理图片点击
    imageContainer.addEventListener('click', function(e) {
        if (e.target === uploadedImage) {
            const rect = uploadedImage.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 创建标记
            const mark = document.createElement('div');
            mark.className = 'mark';
            mark.style.left = x + 'px';
            mark.style.top = y + 'px';
            mark.style.backgroundColor = markColor.value;
            mark.style.width = markSize.value + 'px';
            mark.style.height = markSize.value + 'px';
            // 添加标记索引作为数据属性
            mark.dataset.index = marks.length;
            imageContainer.appendChild(mark);
            
            // 记录标记
            const markInfo = {
                x: Math.round(x),
                y: Math.round(y),
                color: markColor.value,
                size: markSize.value,
                time: new Date().toLocaleString(),
                element: mark  // 保存DOM元素引用
            };
            marks.push(markInfo);
            
            updateMarksList();
            updateCounter();
        }
    });

    // 清除所有标记
    clearMarksButton.addEventListener('click', clearMarks);

    function clearMarks() {
        const existingMarks = imageContainer.querySelectorAll('.mark');
        existingMarks.forEach(mark => mark.remove());
        marks = [];
        updateMarksList();
        updateCounter();
    }

    function updateMarksList() {
        marksList.innerHTML = '';
        // 创建一个标记数组的副本并反转顺序
        const reversedMarks = [...marks].reverse();
        
        reversedMarks.forEach((mark, i) => {
            const originalIndex = marks.length - 1 - i;  // 计算原始索引
            const li = document.createElement('li');
            const colorSquare = `<span style="
                display: inline-block;
                width: 12px;
                height: 12px;
                background-color: ${mark.color};
                margin-right: 5px;
                border-radius: 50%;
            "></span>`;
            const deleteButton = `<button class="delete-mark" data-index="${originalIndex}">删除</button>`;
            li.innerHTML = `${colorSquare}标记 ${originalIndex + 1}: 位置(${mark.x}, ${mark.y}) - 大小:${mark.size}px - ${mark.time} ${deleteButton}`;
            li.dataset.index = originalIndex;
            
            // 添加鼠标悬停效果
            li.addEventListener('mouseenter', () => {
                mark.element.classList.add('mark-highlight');
            });
            li.addEventListener('mouseleave', () => {
                mark.element.classList.remove('mark-highlight');
            });
            
            marksList.appendChild(li);
        });
    }

    // 添加删除单个标记的功能
    marksList.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-mark')) {
            const index = parseInt(e.target.dataset.index);
            // 删除DOM中的标记
            marks[index].element.remove();
            // 从数组中删除标记
            marks.splice(index, 1);
            // 更新剩余标记的索引
            marks.forEach((mark, i) => {
                mark.element.dataset.index = i;
            });
            // 更新列表
            updateMarksList();
            updateCounter();
        }
    });

    // 更新计数器显示
    function updateCounter() {
        marksCounter.textContent = marks.length;
    }

    // 修改保存功能部分
    saveMarksButton.addEventListener('click', function() {
        if (marks.length === 0) {
            alert('没有标记可以保存！');
            return;
        }

        // 准备要保存的文本内容
        let saveText = `图片文件：${imageFileName}\n`;
        saveText += `保存时间：${new Date().toLocaleString()}\n`;
        saveText += `标记总数：${marks.length}\n\n`;
        saveText += `标记详细信息：\n`;
        saveText += `------------------------\n`;
        
        marks.forEach((mark, index) => {
            saveText += `标记 ${index + 1}:\n`;
            saveText += `位置: (${mark.x}, ${mark.y})\n`;
            saveText += `颜色: ${mark.color}\n`;
            saveText += `大小: ${mark.size}px\n`;
            saveText += `时间: ${mark.time}\n`;
            saveText += `------------------------\n`;
        });

        // 创建Blob对象，使用文本格式
        const blob = new Blob([saveText], { type: 'text/plain;charset=utf-8' });
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `标记数据_${imageFileName || 'untitled'}_${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`;
        
        // 触发下载
        document.body.appendChild(a);
        a.click();
        
        // 清理
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // 添加载入功能
    loadMarksInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const content = e.target.result;
                    parseAndRestoreMarks(content);
                } catch (error) {
                    alert('文件格式错误或文件损坏！');
                    console.error('Error loading marks:', error);
                }
            };
            reader.readAsText(file);
        }
    });

    // 解析文本内容并还原标记
    function parseAndRestoreMarks(content) {
        try {
            // 清除现有标记
            clearMarks();

            // 解析文本内容
            const lines = content.split('\n');
            let currentMark = {};
            let markData = [];

            lines.forEach(line => {
                if (line.startsWith('图片文件：')) {
                    // 可以选择是否处理图片文件名
                } else if (line.includes('位置: (')) {
                    // 解析位置信息
                    const coords = line.match(/\((\d+), (\d+)\)/);
                    if (coords) {
                        currentMark.x = parseInt(coords[1]);
                        currentMark.y = parseInt(coords[2]);
                    }
                } else if (line.startsWith('颜色: ')) {
                    currentMark.color = line.split(': ')[1];
                } else if (line.startsWith('大小: ')) {
                    currentMark.size = parseInt(line.split(': ')[1]);
                } else if (line.startsWith('时间: ')) {
                    currentMark.time = line.split(': ')[1];
                } else if (line.startsWith('------------------------')) {
                    if (Object.keys(currentMark).length > 0) {
                        markData.push({...currentMark});
                        currentMark = {};
                    }
                }
            });

            // 还原标记
            markData.forEach(data => {
                const mark = document.createElement('div');
                mark.className = 'mark';
                mark.style.left = data.x + 'px';
                mark.style.top = data.y + 'px';
                mark.style.backgroundColor = data.color;
                mark.style.width = data.size + 'px';
                mark.style.height = data.size + 'px';
                mark.dataset.index = marks.length;
                imageContainer.appendChild(mark);

                // 记录标记
                const markInfo = {
                    x: data.x,
                    y: data.y,
                    color: data.color,
                    size: data.size,
                    time: data.time,
                    element: mark
                };
                marks.push(markInfo);
            });

            // 更新UI
            updateMarksList();
            updateCounter();
            
            alert(`成功载入 ${markData.length} 个标记！`);
        } catch (error) {
            alert('载入标记时发生错误！');
            console.error('Error parsing marks:', error);
        }
    }
}); 