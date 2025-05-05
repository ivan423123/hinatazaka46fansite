// 定数と設定
const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY'; // 実際に使用する際はAPIキーを設定してください
const HINATAZAKA_CHANNELS = {
    'official': 'UCR0V48DJyWbwEAdxLL5FjxA',
    'channel': 'UCOB24f8lQBCnVqPZXOkVpOg'
};
const NEWS_RSS_FEEDS = [
    'https://news.google.com/rss/search?q=%E6%97%A5%E5%90%91%E5%9D%8246&hl=ja&gl=JP&ceid=JP:ja',
    'https://www.nhk.or.jp/rss/news/cat0.xml' // NHKニュース（参考用、実際は日向坂関連のRSSを設定）
];

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

// YouTubeビデオを取得（メインページ用）
function fetchYouTubeVideos() {
    showLoading('youtube-videos');
    
    // 選択されたチャンネル
    const channelId = state.filters.channel === 'all' ? 
        Object.values(HINATAZAKA_CHANNELS).join(',') : 
        state.filters.channel;
    
    // YouTube APIのURLを構築（実際にはAPIキーを設定する必要があります）
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&part=snippet&channelId=${channelId}&maxResults=12&order=${state.filters.videoSort}&type=video&pageToken=${state.youtubeNextPageToken}`;
    
    // 本来ならAPIを呼び出しますが、デモ用のダミーデータを生成します
    // 実際のアプリケーションでは下記のfetchメソッドを使ってAPIを呼び出してください
    /*
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // データ処理
            processYouTubeVideos(data);
        })
        .catch(error => {
            console.error('YouTube APIエラー:', error);
            showErrorMessage('youtube-videos', 'YouTubeデータの読み込みに失敗しました。');
        });
    */
    
    // デモ用のダミーデータ
    setTimeout(() => {
        const dummyData = generateDummyYouTubeData();
        processYouTubeVideos(dummyData);
    }, 1000);
}

// YouTubeビデオを取得（ホームページ用）
function fetchYouTubeVideosForHome() {
    showLoading('home-latest-videos');
    
    // デモ用のダミーデータ
    setTimeout(() => {
        const dummyData = generateDummyYouTubeData(4);
        const videos = dummyData.items;
        
        let html = '';
        videos.slice(0, 4).forEach(video => {
            html += `
                <div class="video-card">
                    <div class="video-thumbnail">
                        <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
                    </div>
                    <div class="video-info">
                        <div class="video-title">${video.snippet.title}</div>
                        <div class="video-channel">${video.snippet.channelTitle}</div>
                        <div class="video-date">${formatDate(video.snippet.publishedAt)}</div>
                    </div>
                </div>
            `;
        });
        
        document.getElementById('home-latest-videos').innerHTML = html;
    }, 800);
}

// YouTubeデータを処理
function processYouTubeVideos(data) {
    // 次ページトークンを保存
    state.youtubeNextPageToken = data.nextPageToken || '';
    
    // 取得したビデオを状態に追加
    state.youtubeVideos = state.youtubeVideos.concat(data.items);
    
    // ビデオを表示
    renderYouTubeVideos();
    
    // 「もっと読み込む」ボタンの表示/非表示
    const loadMoreButton = document.getElementById('load-more-videos');
    loadMoreButton.style.display = state.youtubeNextPageToken ? 'block' : 'none';
}

// YouTubeビデオを表示
function renderYouTubeVideos() {
    const container = document.getElementById('youtube-videos');
    
    let html = '';
    state.youtubeVideos.forEach(video => {
        html += `
            <div class="video-card">
                <a href="https://www.youtube.com/watch?v=${video.id.videoId}" target="_blank" rel="noopener noreferrer">
                    <div class="video-thumbnail">
                        <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
                    </div>
                    <div class="video-info">
                        <div class="video-title">${video.snippet.title}</div>
                        <div class="video-channel">${video.snippet.channelTitle}</div>
                        <div class="video-date">${formatDate(video.snippet.publishedAt)}</div>
                    </div>
                </a>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ニュース記事を取得（メインページ用）
function fetchNewsArticles() {
    showLoading('news-articles');
    
    // 本来はRSSフィードをプロキシサーバー経由で取得する必要があります
    // クライアントサイドのJavaScriptから直接RSSフィードを取得することは
    // CORSポリシーにより制限されています
    
    // デモ用のダミーデータ
    setTimeout(() => {
        const dummyData = generateDummyNewsData();
        processNewsArticles(dummyData);
    }, 1000);
}

// ニュース記事を取得（ホームページ用）
function fetchNewsArticlesForHome() {
    showLoading('home-latest-news');
    
    // デモ用のダミーデータ
    setTimeout(() => {
        const dummyData = generateDummyNewsData(4);
        const articles = dummyData.items;
        
        let html = '';
        articles.slice(0, 4).forEach(article => {
            html += `
                <div class="news-card">
                    <div class="news-content">
                        <div class="news-title">${article.title}</div>
                        <div class="news-source">${article.source}</div>
                        <div class="news-date">${formatDate(article.publishedAt)}</div>
                        <div class="news-description">${article.description}</div>
                    </div>
                </div>
            `;
        });
        
        document.getElementById('home-latest-news').innerHTML = html;
    }, 1000);
}

// ニュースデータを処理
function processNewsArticles(data) {
    // フィルタリング（メンバー名による）
    let articles = data.items;
    if (state.filters.member !== 'all') {
        articles = articles.filter(article => 
            article.title.includes(state.filters.member) || 
            article.description.includes(state.filters.member)
        );
    }
    
    // 並び替え
    articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    
    // 状態に保存
    state.newsArticles = articles;
    
    // ニュースを表示
    renderNewsArticles();
}

// ニュース記事を表示
function renderNewsArticles() {
    const container = document.getElementById('news-articles');
    
    if (state.newsArticles.length === 0) {
        container.innerHTML = '<div class="no-results">該当する記事が見つかりませんでした。</div>';
        return;
    }