let currentFocus = -1; // 当前选中的搜索结果索引
const MAX_RESULTS = 10; // 最大搜索结果显示数量

// 处理键盘事件
function handleKeyEvents(e) {
    const items = document.getElementsByClassName('search-item');
    if (e.key === 'ArrowDown') {
        // 向下箭头键，选中下一个搜索结果
        if (currentFocus < items.length - 1) {
            currentFocus++;
        }
        updateSelection();
    } else if (e.key === 'ArrowUp') {
        // 向上箭头键，选中上一个搜索结果
        if (currentFocus > -1) {
            currentFocus--;
        }
        updateSelection();
    } else if (e.key === 'Enter') {
        // 回车键，跳转到选中的搜索结果
        e.preventDefault();
        if (currentFocus > -1) {
            items[currentFocus].click();
            // 清空搜索框
            document.getElementById('searchInput').value = '';
            // 隐藏搜索结果
            document.getElementById('searchResults').style.display = 'none';
        }
    } else {
        // 其他键，执行搜索
        currentFocus = -1;
        performSearch(e.target.value);
    }
}

// 更新搜索结果选中状态
function updateSelection() {
    const items = document.getElementsByClassName('search-item');
    Array.from(items).forEach((item, index) => {
        item.classList.toggle('selected-item', index === currentFocus);
    });
}

// 执行搜索
function performSearch(keyword) {
    const resultsContainer = document.getElementById('searchResults');
    if (!keyword) {
        // 清空搜索结果
        resultsContainer.style.display = 'none';
        return;
    }
    // 确保 knowledgeData 已经正确加载
    if (!knowledgeData ||!Array.isArray(knowledgeData)) {
        console.error('knowledgeData is not defined or not an array');
        return;
    }
    const allItems = [];
    function flattenData(data) {
        data.forEach(item => {
            allItems.push(item);
            if (item.children) {
                flattenData(item.children);
            }
        });
    }
    flattenData(knowledgeData);
    const filtered = allItems.filter(item =>
        item.title.toLowerCase().includes(keyword.toLowerCase()) ||
        item.content.toLowerCase().includes(keyword.toLowerCase())
    ).slice(0, MAX_RESULTS);
    // 渲染搜索结果
    renderResults(filtered, keyword);
}

// 渲染搜索结果
function renderResults(results, keyword) {
    const container = document.getElementById('searchResults');
    if (results.length === 0) {
        // 未找到结果
        container.innerHTML = `<div class="no-results">未找到"<span class="highlight">${keyword}</span>"相关结果</div>`;
    } else {
        // 渲染搜索结果项
        container.innerHTML = results.map(item => `
            <div class="search-item" onclick="jumpToNode(${item.id})" onmouseover="currentFocus = -1">
                <div class="title">${highlightText(item.title, keyword)}</div>
                <div class="excerpt">${getExcerpt(item.content, keyword)}</div>
            </div>
        `).join('');
    }
    container.style.display = 'block';
}

// 高亮搜索关键词
function highlightText(text, keyword) {
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// 获取搜索结果摘要
function getExcerpt(content, keyword) {
    const index = content.toLowerCase().indexOf(keyword.toLowerCase());
    const start = Math.max(0, index - 30);
    const end = Math.min(content.length, index + keyword.length + 70);
    let excerpt = content.slice(start, end);
    if (start > 0) excerpt = '...' + excerpt;
    if (end < content.length) excerpt += '...';
    return highlightText(excerpt, keyword);
}

// 立即返回主页
function goToHomePageImmediately() {
    try {
        // 初始化主页内容
        initHomePage();
        console.log('主页内容初始化成功');

        // 隐藏内容容器
        const contentContainer = document.getElementById('content-container');
        if (contentContainer) {
            contentContainer.style.display = 'none';
            console.log('内容容器已隐藏');
        } else {
            console.error('未找到内容容器');
        }

        // 显示主页
        const homePage = document.getElementById('homePage');
        if (homePage) {
            homePage.style.display = 'block';
            console.log('主页已显示');
        } else {
            console.error('未找到主页元素');
        }

        // 关闭详情页模态框
        closeDetail();
        console.log('详情页模态框已关闭');

        // 清空搜索框
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
            console.log('搜索框已清空');
        } else {
            console.error('未找到搜索框');
        }

        // 隐藏搜索结果
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.style.display = 'none';
            console.log('搜索结果已隐藏');
        } else {
            console.error('未找到搜索结果容器');
        }

        // 隐藏菜单内容
        const menuContent = document.getElementById('menu-content');
        if (menuContent) {
            menuContent.style.display = 'none';
            console.log('菜单内容已隐藏');
        } else {
            console.error('未找到菜单内容容器');
        }
    } catch (error) {
        console.error('返回主页时出现错误:', error);
    }
}

// 初始化主页内容
function initHomePage() {
    const container = document.getElementById('homePage');
    let cardsHtml = '';
    const allItems = [];
    function flattenData(data) {
        data.forEach(item => {
            allItems.push(item);
            if (item.children) {
                flattenData(item.children);
            }
        });
    }
    flattenData(knowledgeData);
    allItems.forEach(item => {
        cardsHtml += `
            <div class="card" onclick="showDetail(${item.id})">
                <h2>${item.title}</h2>
            </div>
        `;
    });
    container.innerHTML = cardsHtml;

    // 重置卡片布局
    const cardGrid = document.querySelector('.card-grid');
    if (cardGrid) {
        if (window.innerWidth > 768) {
            cardGrid.style.gridTemplateColumns = `repeat(auto-fill, minmax(300px, 1fr))`;
        } else if (window.innerWidth > 480) {
            cardGrid.style.gridTemplateColumns = `repeat(auto-fill, minmax(250px, 1fr))`;
        } else {
            cardGrid.style.gridTemplateColumns = `repeat(1, 1fr)`;
        }
    }
}

// 显示详情页
function showDetail(id) {
    const allItems = [];
    function flattenData(data) {
        data.forEach(item => {
            allItems.push(item);
            if (item.children) {
                flattenData(item.children);
            }
        });
    }
    flattenData(knowledgeData);
    const data = allItems.find(item => item.id === id);
    if (data) {
        const modal = document.getElementById('detailModal');
        modal.style.display = 'block';
        document.getElementById('detailTitle').textContent = data.title;
        document.getElementById('detailContent').textContent = data.content;
    }
}

// 关闭详情页
function closeDetail() {
    const modal = document.getElementById('detailModal');
    modal.style.display = 'none';
}

// 返回主页
function goBack() {
    // 初始化主页内容
    initHomePage();
    // 隐藏内容容器
    document.getElementById('content-container').style.display = 'none';
    // 显示主页
    document.getElementById('homePage').style.display = 'block';
    // 关闭详情页模态框
    closeDetail();
    // 清空搜索框
    document.getElementById('searchInput').value = '';
    // 隐藏搜索结果
    document.getElementById('searchResults').style.display = 'none';
}

// 跳转到指定节点
function jumpToNode(id) {
    showDetail(id);
    // 清空搜索框
    document.getElementById('searchInput').value = '';
    // 隐藏搜索结果
    document.getElementById('searchResults').style.display = 'none';
}

// 页面加载完成后初始化主页内容
window.onload = initHomePage;

// 窗口大小改变时调整卡片布局
window.onresize = () => {
    const cardGrid = document.querySelector('.card-grid');
    if (window.innerWidth > 768) {
        cardGrid.style.gridTemplateColumns = `repeat(auto-fill, minmax(300px, 1fr))`;
    } else if (window.innerWidth > 480) {
        cardGrid.style.gridTemplateColumns = `repeat(auto-fill, minmax(250px, 1fr))`;
    } else {
        cardGrid.style.gridTemplateColumns = `repeat(1, 1fr)`;
    }
};

// 添加点击三条杠图标后显示和隐藏菜单内容的函数。
function toggleMenu() {
    const menuContent = document.getElementById('menu-content');
    if (menuContent.style.display === 'none') {
        menuContent.style.display = 'block';
    } else {
        menuContent.style.display = 'none';
    }
}

// 推荐书籍函数
function showRecommendedBooks() {
    const contentContainer = document.getElementById('content-container');
    const homePage = document.getElementById('homePage');
    const menuContent = document.getElementById('menu-content');
    // 隐藏主页
    homePage.style.display = 'none';
    // 显示内容容器
    contentContainer.style.display = 'block';
    // 隐藏菜单内容
    menuContent.style.display = 'none';
    // 填充推荐书籍内容
    contentContainer.innerHTML = `
        <h2>推荐教材</h2>
        <div class="book-card">
            <h3>信号与系统（第二版）</h3>
            <p>作者：郑君里</p>
            <p>出版社：高等教育出版社</p>
            <p>难度：入门</p>
            <p>国内经典教材，内容全面，适合初学者</p>
        </div>
        <div class="book-card">
            <h3>Signals and Systems</h3>
            <p>作者: Alan V. Oppenheim</p>
            <p>出版社: Prentice Hall</p>
            <p>难度：进阶</p>
            <p>国际经典教材，理论深入，适合深入学习</p>
        </div>
        <div class="book-card">
            <h3>信号与系统分析</h3>
            <p>作者：吴大正</p>
            <p>出版社：西安电子科技大学出版社</p>
            <p>难度：应用</p>
            <p>实践性强，例题丰富，适合工程应用</p>
        </div>
    `;
}

function showOutline() {
    const contentContainer = document.getElementById('content-container');
    const homePage = document.getElementById('homePage');
    const menuContent = document.getElementById('menu-content');
    // 隐藏主页
    homePage.style.display = 'none';
    // 隐藏内容容器（因为不再展示目录大纲内容到这里）
    contentContainer.style.display = 'none';
    // 隐藏菜单内容
    menuContent.style.display = 'none';
    // 显示图片模态框
    const imageModal = document.getElementById('imageModal');
    imageModal.style.display = 'block';
}

function closeImageModal() {
    const imageModal = document.getElementById('imageModal');
    imageModal.style.display = 'none';
}

// 切换子菜单的显示和隐藏
function toggleSubMenu(liElement, level) {
    const subMenu = liElement.querySelector('ul');
    if (subMenu) {
        const isOpen = liElement.classList.contains('open');
        if (isOpen) {
            // 关闭子菜单
            subMenu.style.maxHeight = '0';
            subMenu.style.opacity = '0';
            setTimeout(() => {
                subMenu.style.display = 'none';
            }, 300);
            liElement.classList.remove('open');
        } else {
            // 打开子菜单
            subMenu.style.display = 'block';
            subMenu.style.maxHeight = '0';
            subMenu.style.opacity = '0';
            setTimeout(() => {
                subMenu.style.maxHeight = '1000px'; // 一个足够大的值
                subMenu.style.opacity = '1';
            }, 10);
            liElement.classList.add('open');
        }
    }
}


function jumpToCard(title) {
    const allItems = [];
    knowledgeData.forEach(item => {
        allItems.push(item);
        if (item.children) {
            allItems.push(...item.children);
        }
    });
    const targetItem = allItems.find(item => item.title === title);
    if (targetItem) {
        showDetail(targetItem.id);
    }
}

// 侧边栏点击事件处理函数
function handleSidebarClick(category) {
    const homePage = document.getElementById('homePage');
    homePage.innerHTML = '';

    // 扁平化所有知识点
    const allItems = [];
    function flattenData(data) {
        data.forEach(item => {
            allItems.push(item);
            if (item.children) {
                flattenData(item.children);
            }
        });
    }
    flattenData(knowledgeData);

    if (category === '变换对') {
        const transformPairs = allItems.filter(item =>
            item.title.includes('变换对')
        );
        transformPairs.forEach(item => {
            homePage.innerHTML += `
                <div class="card" onclick="showDetail(${item.id})">
                    <h2>${item.title}</h2>
                </div>
            `;
        });
    } else {
        // 其他分类，显示除变换对之外的所有内容
        const otherItems = allItems.filter(item =>
            !item.title.includes('变换对')
        );
        otherItems.forEach(item => {
            homePage.innerHTML += `
                <div class="card" onclick="showDetail(${item.id})">
                    <h2>${item.title}</h2>
                </div>
            `;
        });
    }
}

