// 定数と設定
const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY'; // 実際に使用する際はAPIキーを設定してください
const HINATAZAKA_CHANNELS = {
    'official': 'UCR0V48DJyWbwEAdxLL5FjxA',
    'channel': 'UCOB24f8lQBCnVqPZXOkVpOg'
};

// メンバー一覧（フィルタリング用）
const MEMBERS = [
　'河田陽菜', '金村美玖', '富田鈴花', '松田好花', '小坂菜緒',
　'上村ひなの', '髙橋未来虹', '森本茉莉', '山口陽世',
  '石塚瑶季','清水理央','正源司陽子','竹内希来里','平尾帆夏',
  '平岡海月','藤嶌果歩','宮地すみれ','山下葉留花','渡辺莉奈',
  '大田美月','大野愛実','片山紗希','蔵盛妃那乃','坂井新奈',
  '佐藤優羽','下田衣珠季','高井俐香','鶴崎仁香','松尾桜'
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
        filterNewsArticles();
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
        fetchNewsArticles(true);
    });
}

// YouTubeビデオを取得（メインページ用）
function fetchYouTubeVideos() {
    showLoading('youtube-videos');
    
    // YouTube APIキーが設定されていれば実際のデータを取得
    if (YOUTUBE_API_KEY !== 'YOUR_YOUTUBE_API_KEY') {
        fetchActualYouTubeVideos();
    } else {
        document.getElementById('youtube-videos').innerHTML = '<div class="error">YouTube APIキーが設定されていません。</div>';
        document.getElementById('load-more-videos').style.display = 'none';
    }
}

// 実際のYouTube APIを使用してビデオを取得
async function fetchActualYouTubeVideos() {
    try {
        let channelId = '';
        if (state.filters.channel !== 'all') {
            channelId = state.filters.channel;
        }
        
        const params = new URLSearchParams({
            part: 'snippet',
            maxResults: 12,
            key: YOUTUBE_API_KEY,
            order: state.filters.videoSort,
            type: 'video'
        });
        
        if (channelId) {
            params.append('channelId', channelId);
        } else {
            params.append('q', '日向坂46');
        }
        
        if (state.youtubeNextPageToken) {
            params.append('pageToken', state.youtubeNextPageToken);
        }
        
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        if (data.items && data.items.length > 0) {
            // 新しい動画を追加
            const newVideos = data.items.map(item => ({
                id: item.id.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.high.url,
                channelTitle: item.snippet.channelTitle,
                channelId: item.snippet.channelId,
                publishedAt: new Date(item.snippet.publishedAt)
            }));
            
            state.youtubeVideos = [...state.youtubeVideos, ...newVideos];
            state.youtubeNextPageToken = data.nextPageToken || '';
            
            renderYouTubeVideos();
        } else {
            document.getElementById('youtube-videos').innerHTML = '<div class="no-results">動画が見つかりませんでした。</div>';
        }
        
        // もっと読み込むボタンの表示・非表示
        document.getElementById('load-more-videos').style.display = data.nextPageToken ? 'block' : 'none';
        
    } catch (error) {
        console.error('YouTube API エラー:', error);
        document.getElementById('youtube-videos').innerHTML = `<div class="error">動画の読み込みに失敗しました。${error.message}</div>`;
        document.getElementById('load-more-videos').style.display = 'none';
    }
}

// YouTubeビデオを表示
function renderYouTubeVideos() {
    const container = document.getElementById('youtube-videos');
    
    let html = '';
    state.youtubeVideos.forEach(video => {
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = video.publishedAt.toLocaleDateString('ja-JP', dateOptions);
        
        html += `
            <div class="video-card">
                <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank" rel="noopener noreferrer">
                    <div class="video-thumbnail">
                        <img src="${video.thumbnail}" alt="${video.title}">
                    </div>
                    <div class="video-info">
                        <div class="video-title">${video.title}</div>
                        <div class="video-channel">${video.channelTitle}</div>
                        <div class="video-date">${formattedDate}</div>
                    </div>
                </a>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// YouTubeビデオを取得（ホームページ用）
function fetchYouTubeVideosForHome() {
    showLoading('home-latest-videos');
    
    // YouTube APIキーが設定されていれば実際のデータを取得
    if (YOUTUBE_API_KEY !== 'YOUR_YOUTUBE_API_KEY') {
        fetchHomeYouTubeVideos();
    } else {
        document.getElementById('home-latest-videos').innerHTML = '<div class="error">YouTube APIキーが設定されていません。</div>';
    }
}

// ホーム用の実際のYouTube APIからビデオを取得
async function fetchHomeYouTubeVideos() {
    try {
        const params = new URLSearchParams({
            part: 'snippet',
            maxResults: 4,
            key: YOUTUBE_API_KEY,
            order: 'date',
            type: 'video',
            q: '日向坂46'
        });
        
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        if (data.items && data.items.length > 0) {
            let html = '';
            data.items.forEach(item => {
                const publishedAt = new Date(item.snippet.publishedAt);
                const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                const formattedDate = publishedAt.toLocaleDateString('ja-JP', dateOptions);
                
                html += `
                    <div class="video-card">
                        <a href="https://www.youtube.com/watch?v=${item.id.videoId}" target="_blank" rel="noopener noreferrer">
                            <div class="video-thumbnail">
                                <img src="${item.snippet.thumbnails.high.url}" alt="${item.snippet.title}">
                            </div>
                            <div class="video-info">
                                <div class="video-title">${item.snippet.title}</div>
                                <div class="video-channel">${item.snippet.channelTitle}</div>
                                <div class="video-date">${formattedDate}</div>
                            </div>
                        </a>
                    </div>
                `;
            });
            
            document.getElementById('home-latest-videos').innerHTML = html;
        } else {
            document.getElementById('home-latest-videos').innerHTML = '<div class="no-results">動画が見つかりませんでした。</div>';
        }
    } catch (error) {
        console.error('YouTube API エラー (ホーム):', error);
        document.getElementById('home-latest-videos').innerHTML = `<div class="error">動画の読み込みに失敗しました。${error.message}</div>`;
    }
}

// ニュース記事を取得（メインページ用）
async function fetchNewsArticles(append = false) {
    const container = document.getElementById('news-articles');
    if (!append) {
        showLoading('news-articles');
        state.newsArticles = [];
    }
    
    try {
        // news-service.jsから関数を呼び出し
        const articles = await getRssNews(10);
        
        if (append) {
            state.newsArticles = [...state.newsArticles, ...articles];
        } else {
            state.newsArticles = articles;
        }
        
        // メンバーフィルターを適用
        filterNewsArticles();
    } catch (error) {
        console.error('ニュース取得エラー:', error);
        container.innerHTML = '<div class="error">ニュースの読み込みに失敗しました。</div>';
        document.getElementById('load-more-news').style.display = 'none';
    }
}

// メンバーフィルターを適用してニュース記事を表示
function filterNewsArticles() {
    const filteredArticles = filterByMember(state.newsArticles, state.filters.member);
    renderNewsArticles(filteredArticles);
}

// ニュース記事を表示
function renderNewsArticles(articles = null) {
    const container = document.getElementById('news-articles');
    const displayArticles = articles || filterByMember(state.newsArticles, state.filters.member);
    
    if (displayArticles.length === 0) {
        container.innerHTML = '<div class="no-results">該当する記事が見つかりませんでした。</div>';
        document.getElementById('load-more-news').style.display = 'none';
        return;
    }
    
    // ソート（日時順のみ）
    const sortedArticles = [...displayArticles].sort((a, b) => {
        if (state.filters.newsSort === 'date') {
            return b.rawDate - a.rawDate;
        }
        return 0;
    });
    
    let html = '';
    sortedArticles.forEach(article => {
        html += generateNewsCardHtml(article);
    });
    
    container.innerHTML = html;
    
    // もっと読み込むボタンを表示（RSSフィードの限界による）
    document.getElementById('load-more-news').style.display = sortedArticles.length >= 10 ? 'block' : 'none';
}

// ニュース記事を取得（ホームページ用）
async function fetchNewsArticlesForHome() {
    showLoading('home-latest-news');
    
    try {
        // news-service.jsから関数を呼び出し
        const articles = await getRssNews(4);
        
        let html = '';
        articles.slice(0, 4).forEach(article => {
            html += generateNewsCardHtml(article);
        });
        
        document.getElementById('home-latest-news').innerHTML = html;
    } catch (error) {
        console.error('ホームニュース取得エラー:', error);
        document.getElementById('home-latest-news').innerHTML = '<div class="error">ニュースの読み込みに失敗しました。</div>';
    }
}

// ヘルパー関数：ローディング表示
function showLoading(containerId) {
    document.getElementById(containerId).innerHTML = '<div class="loading">読み込み中...</div>';
}

// ヘルパー関数：エラーメッセージ表示
function showErrorMessage(containerId, message) {
    document.getElementById(containerId).innerHTML = `<div class="error">${message}</div>`;
}