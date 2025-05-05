// 定数と設定
const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY'; // 実際に使用する際はAPIキーを設定してください
const HINATAZAKA_CHANNELS = {
    'official': 'UCR0V48DJyWbwEAdxLL5FjxA',
    'channel': 'UCOB24f8lQBCnVqPZXOkVpOg'
};
const NEWS_RSS_URL = 'https://news.google.com/rss/search?q=%E6%97%A5%E5%90%91%E5%9D%8246&hl=ja&gl=JP&ceid=JP:ja';
const CORS_PROXY = 'https://api.allorigins.win/get?url=';

// メンバー一覧（フィルタリング用）
const MEMBERS = [
    '佐々木久美', '丹生明里', '加藤史帆', '齊藤京子', '東村芽依', '河田陽菜', '金村美玖',
    '富田鈴花', '松田好花', '宮田愛萌', '渡邉美穂', '上村ひなの', '髙橋未来虹', '森本茉莉',
    '山口陽世', '清水理央'
];

// アプリケーションの状態管理
const state = {
    currentPage: 'home',
    youtubeVideos: [],
    youtubeNextPageToken: '',
    newsArticles: [],
    newsPage: 1,
    filters: {
        channel: 'all',
        videoSort: 'date',
        member: 'all',
        newsSort: 'date'
    }
};

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {
    // ナビゲーションの設定
    setupNavigation();
    
    // 初期データの読み込み
    loadInitialData();
    
    // フィルターとソートのイベントリスナー設定
    setupFiltersAndSorting();
    
    // もっと読み込むボタンのイベントリスナー設定
    setupLoadMoreButtons();
});

// ナビゲーションの設定
function setupNavigation() {
    // ホームへのナビゲーション
    document.getElementById('home-nav').addEventListener('click', (e) => {
        e.preventDefault();
        changePage('home');
    });
    
    // YouTubeページへのナビゲーション
    document.getElementById('youtube-nav').addEventListener('click', (e) => {
        e.preventDefault();
        changePage('youtube');
    });
    
    // ニュースページへのナビゲーション
    document.getElementById('news-nav').addEventListener('click', (e) => {
        e.preventDefault();
        changePage('news');
    });
    
    // ホームページの「もっと見る」リンク
    document.getElementById('more-youtube').addEventListener('click', (e) => {
        e.preventDefault();
        changePage('youtube');
    });
    
    document.getElementById('more-news').addEventListener('click', (e) => {
        e.preventDefault();
        changePage('news');
    });
}

// ページ切り替え処理
function changePage(pageName) {
    // 現在のページを非アクティブにする
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active-page');
    });
    
    // ナビゲーションリンクをすべて非アクティブにする
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    // 選択されたページをアクティブにする
    document.getElementById(`${pageName}-page`).classList.add('active-page');
    document.getElementById(`${pageName}-nav`).classList.add('active');
    
    // 状態を更新
    state.currentPage = pageName;
    
    // ページに応じたデータ読み込み
    if (pageName === 'youtube' && state.youtubeVideos.length === 0) {
        fetchYouTubeVideos();
    } else if (pageName === 'news' && state.newsArticles.length === 0) {
        fetchNewsArticles();
    }
}

// 初期データの読み込み
function loadInitialData() {
    // ホームページの最新YouTubeビデオ（少数）を読み込む
    fetchYouTubeVideosForHome();
    
    // ホームページの最新ニュース（少数）を読み込む
    fetchNewsArticlesForHome();
    
    // メンバーフィルターの設定
    populateMemberFilter();
}

// メンバーフィルターの設定
function populateMemberFilter() {
    const memberFilter = document.getElementById('member-filter');
    // すでに基本的なオプションはHTMLで定義済み
    
    // 残りのメンバーを追加
    MEMBERS.forEach(member => {
        // すでに存在するオプションはスキップ
        const exists = Array.from(memberFilter.options).some(option => option.value === member);
        if (!exists) {
            const option = document.createElement('option');
            option.value = member;
            option.textContent = member;
            memberFilter.appendChild(option);
        }
    });
}

// フィルターとソートのイベントリスナー設定
function setupFiltersAndSorting() {
    // チャンネルフィルター
    document.getElementById('channel-filter').addEventListener('change', (e) => {
        state.filters.channel = e.target.value;
        state.youtubeVideos = [];
        state.youtubeNextPageToken = '';
        fetchYouTubeVideos();
    });
    
    // 動画ソート
    document.getElementById('video-sort').addEventListener('change', (e) => {
        state.filters.videoSort = e.target.value;
        state.youtubeVideos = [];
        state.youtubeNextPageToken = '';
        fetchYouTubeVideos();
    });
    
    // メンバーフィルター
    document.getElementById('member-filter').addEventListener('change', (e) => {
        state.filters.member = e.target.value;
        state.newsArticles = [];
        state.newsPage = 1;
        fetchNewsArticles();
    });
    
    // ニュースソート
    document.getElementById('news-sort').addEventListener('change', (e) => {
        state.filters.newsSort = e.target.value;
        renderNewsArticles(); // 並び替えて表示し直し
    });
}

// もっと読み込むボタンのイベントリスナー設定
function setupLoadMoreButtons() {
    // YouTubeビデオをもっと読み込む
    document.getElementById('load-more-videos').addEventListener('click', () => {
        fetchYouTubeVideos();
    });
    
    // ニュース記事をもっと読み込む
    document.getElementById('load-more-news').addEventListener('click', () => {
        state.newsPage++;
        fetchNewsArticles();
    });
}

// YouTubeビデオを取得（メインページ用）
function fetchYouTubeVideos() {
    showLoading('youtube-videos');
    
    // 本来はYouTube APIを使用しますが、デモではダミーデータを使用
    // YouTubeチャンネルからの動画表示は実際のAPIキーが必要です
    setTimeout(() => {
        generateDummyYouTubeVideos(12);
    }, 1000);
}

// YouTubeビデオを取得（ホームページ用）
function fetchYouTubeVideosForHome() {
    showLoading('home-latest-videos');
    
    // デモ用ダミーデータ
    setTimeout(() => {
        generateDummyYouTubeVideos(4, 'home-latest-videos');
    }, 800);
}

// ダミーのYouTubeビデオデータを生成して表示
function generateDummyYouTubeVideos(count, containerId = 'youtube-videos') {
    const titles = [
        '【日向坂46】「君しか勝たん」MUSIC VIDEO',
        '【日向坂46】メンバー全員で初カラオケ！【ひなたのはげまし】',
        '【日向坂46】最新シングル発売記念特番',
        '日向坂46 ひなたのはげまし #24「春のピクニック」',
        '【日向坂46】ひなくり2024〜HAPPY NEW HINATA〜ダイジェスト',
        '日向坂46 4thアルバム「何度目の青空か?」全曲紹介',
        '【日向坂46】メンバーで料理対決！【ひなたのはげまし】',
        '日向坂46 齊藤京子が語る新曲の魅力'
    ];
    
    const channels = [
        { title: '日向坂46official', id: 'UCR0V48DJyWbwEAdxLL5FjxA' },
        { title: '日向坂ちゃんねる', id: 'UCOB24f8lQBCnVqPZXOkVpOg' }
    ];
    
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    
    let html = '';
    for (let i = 0; i < count; i++) {
        const randomTitle = titles[Math.floor(Math.random() * titles.length)];
        const randomChannel = channels[Math.floor(Math.random() * channels.length)];
        const randomDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
        const videoId = `dummy${Math.floor(Math.random() * 1000000)}`;
        
        html += `
            <div class="video-card">
                <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener noreferrer">
                    <div class="video-thumbnail">
                        <img src="/api/placeholder/320/180" alt="${randomTitle}">
                    </div>
                    <div class="video-info">
                        <div class="video-title">${randomTitle}</div>
                        <div class="video-channel">${randomChannel.title}</div>
                        <div class="video-date">${randomDate.toLocaleDateString('ja-JP', dateOptions)}</div>
                    </div>
                </a>
            </div>
        `;
    }
    
    document.getElementById(containerId).innerHTML = html;
    
    // もっと読み込むボタンの表示・非表示
    if (containerId === 'youtube-videos') {
        document.getElementById('load-more-videos').style.display = count < 30 ? 'block' : 'none';
    }
}

// ニュース記事を取得（メインページ用）
async function fetchNewsArticles() {
    showLoading('news-articles');
    
    try {
        const articles = await fetchRssNews();
        processNewsArticles(articles);
    } catch (error) {
        console.error('ニュース取得エラー:', error);
        showErrorMessage('news-articles', 'ニュースの読み込みに失敗しました。');
    }
}

// ニュース記事を取得（ホームページ用）
async function fetchNewsArticlesForHome() {
    showLoading('home-latest-news');
    
    try {
        const articles = await fetchRssNews(4);
        
        let html = '';
        articles.slice(0, 4).forEach(article => {
            html += `
                <div class="news-card">
                    <div class="news-content">
                        <a href="${article.link}" target="_blank" rel="noopener noreferrer">
                            <div class="news-title">${article.title}</div>
                        </a>
                        <div class="news-source">${article.source || 'Google News'}</div>
                        <div class="news-date">${article.pubDate}</div>
                        <div class="news-description">${article.description || ''}</div>
                    </div>
                </div>
            `;
        });
        
        document.getElementById('home-latest-news').innerHTML = html;
    } catch (error) {
        console.error('ホームニュース取得エラー:', error);
        showErrorMessage('home-latest-news', 'ニュースの読み込みに失敗しました。');
    }
}

// RSSフィードからニュースを取得
async function fetchRssNews(limit = 10) {
    const url = `${CORS_PROXY}${encodeURIComponent(NEWS_RSS_URL)}`;
    const response = await fetch(url);
    const data = await response.json();
    
    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents, 'text/xml');
    const items = xml.querySelectorAll('item');
    
    const articles = [];
    items.forEach((item, index) => {
        if (index < limit) {
            const title = item.querySelector('title')?.textContent || '';
            const link = item.querySelector('link')?.textContent || '';
            const pubDate = item.querySelector('pubDate')?.textContent || '';
            const description = item.querySelector('description')?.textContent || '';
            const source = item.querySelector('source')?.textContent || 'Google News';
            
            // 日付をフォーマット
            const date = new Date(pubDate);
            const formattedDate = date.toLocaleDateString('ja-JP', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            articles.push({
                title,
                link,
                pubDate: formattedDate,
                description,
                source
            });
        }
    });
    
    return articles;
}

// ニュースデータを処理
function processNewsArticles(articles) {
    // フィルタリング（メンバー名による）
    if (state.filters.member !== 'all') {
        articles = articles.filter(article => 
            article.title.includes(state.filters.member) || 
            (article.description && article.description.includes(state.filters.member))
        );
    }
    
    // 状態に記事を保存
    state.newsArticles = articles;
    
    // 記事を表示
    renderNewsArticles();
}

// ニュース記事を表示
function renderNewsArticles() {
    const container = document.getElementById('news-articles');
    
    if (state.newsArticles.length === 0) {
        container.innerHTML = '<div class="no-results">該当する記事が見つかりませんでした。</div>';
        return;
    }
    
    let html = '';
    state.newsArticles.forEach(article => {
        html += `
            <div class="news-card">
                <div class="news-content">
                    <a href="${article.link}" target="_blank" rel="noopener noreferrer">
                        <div class="news-title">${article.title}</div>
                    </a>
                    <div class="news-source">${article.source || 'Google News'}</div>
                    <div class="news-date">${article.pubDate}</div>
                    <div class="news-description">${article.description || ''}</div>
                    
                    <div class="news-tags">
                        ${MEMBERS.some(member => article.title.includes(member)) ? 
                          MEMBERS.filter(member => article.title.includes(member))
                                 .map(member => `<span class="news-tag">${member}</span>`)
                                 .join('') : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // もっと読み込むボタンを非表示（RSSフィードの限界による）
    document.getElementById('load-more-news').style.display = 'none';
}

// ヘルパー関数：ローディング表示
function showLoading(containerId) {
    document.getElementById(containerId).innerHTML = '<div class="loading">読み込み中...</div>';
}

// ヘルパー関数：エラーメッセージ表示
function showErrorMessage(containerId, message) {
    document.getElementById(containerId).innerHTML = `<div class="error">${message}</div>`;
}