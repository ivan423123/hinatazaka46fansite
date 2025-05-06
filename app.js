// 定数と設定
const HINATAZAKA_CHANNELS = {
    'official': 'UCR0V48DJyWbwEAdxLL5FjxA',
    'channel': 'UCOB24f8lQBCnVqPZXOkVpOg'
};

// メンバー一覧（フィルタリング用）
const MEMBERS = [
　'河田陽菜', '金村美玖', '富田鈴花', '松田好花', '小坂菜緒',
　'上村ひなの', '髙橋未来虹', '森本茉莉', '山口陽世',
  '石塚瑶季','清水理央','正源司陽子','竹内希来里','平尾帆夏',
  '平岡海月','藤嶌果歩','宮地すみれ','山下葉留花','渡辺莉奈'
];

// ブログ情報
const BLOG_URLS = {
  '金村美玖': 'http://ino.xrea.jp/hinatazaka46/?id=12',
  '河田陽菜': 'http://ino.xrea.jp/hinatazaka46/?id=13',
  '小坂菜緒': 'http://ino.xrea.jp/hinatazaka46/?id=14',
  '富田鈴花': 'http://ino.xrea.jp/hinatazaka46/?id=15',
  '松田好花': 'http://ino.xrea.jp/hinatazaka46/?id=18',
  '上村ひなの': 'http://ino.xrea.jp/hinatazaka46/?id=21',
  '髙橋未来虹': 'http://ino.xrea.jp/hinatazaka46/?id=22',
  '森本茉莉': 'http://ino.xrea.jp/hinatazaka46/?id=23',
  '山口陽世': 'http://ino.xrea.jp/hinatazaka46/?id=24',
  '石塚瑶季': 'http://ino.xrea.jp/hinatazaka46/?id=25',
  '小西夏菜実': 'http://ino.xrea.jp/hinatazaka46/?id=27',
  '清水理央': 'http://ino.xrea.jp/hinatazaka46/?id=28',
  '正源司陽子': 'http://ino.xrea.jp/hinatazaka46/?id=29',
  '竹内希来里': 'http://ino.xrea.jp/hinatazaka46/?id=30',
  '平尾帆夏': 'http://ino.xrea.jp/hinatazaka46/?id=31',
  '平岡海月': 'http://ino.xrea.jp/hinatazaka46/?id=32',
  '藤嶌果歩': 'http://ino.xrea.jp/hinatazaka46/?id=33',
  '宮地すみれ': 'http://ino.xrea.jp/hinatazaka46/?id=34',
  '山下葉留花': 'http://ino.xrea.jp/hinatazaka46/?id=35',
  '渡辺莉奈': 'http://ino.xrea.jp/hinatazaka46/?id=36'
};

// アプリケーションの状態管理
const state = {
    currentPage: 'home',
    youtubeVideos: [],
    newsArticles: [],
    blogEntries: [],
    newsPage: 1,
    filters: {
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
    
    // フィルターのイベントリスナー設定
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
    
    // ブログページへのナビゲーション
    document.getElementById('blog-nav').addEventListener('click', (e) => {
        e.preventDefault();
        changePage('blog');
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
    
    document.getElementById('more-blog').addEventListener('click', (e) => {
        e.preventDefault();
        changePage('blog');
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
        fetchYouTubeVideosRSS();
    } else if (pageName === 'news' && state.newsArticles.length === 0) {
        fetchNewsArticles();
    } else if (pageName === 'blog' && state.blogEntries.length === 0) {
        fetchBlogEntries();
    }
}

// 初期データの読み込み
function loadInitialData() {
    // ホームページの最新YouTubeビデオ（少数）を読み込む
    fetchYouTubeVideosForHome();
    
    // ホームページの最新ニュース（少数）を読み込む
    fetchNewsArticlesForHome();
    
    // ホームページのブログエントリー（少数）を読み込む
    fetchBlogEntriesForHome();
    
    // メンバーフィルターの設定
    populateMemberFilter();
}

// メンバーフィルターの設定
function populateMemberFilter() {
    const memberFilterNews = document.getElementById('member-filter-news');
    const memberFilterBlog = document.getElementById('member-filter-blog');
    
    // すでに基本的なオプションはHTMLで定義済み
    
    // すべてのメンバーを追加
    Object.keys(BLOG_URLS).forEach(member => {
        // ニュースのメンバーフィルターに追加
        const optionNews = document.createElement('option');
        optionNews.value = member;
        optionNews.textContent = member;
        memberFilterNews.appendChild(optionNews);
        
        // ブログのメンバーフィルターに追加
        const optionBlog = document.createElement('option');
        optionBlog.value = member;
        optionBlog.textContent = member;
        memberFilterBlog.appendChild(optionBlog);
    });
}

// フィルターのイベントリスナー設定
function setupFiltersAndSorting() {
    // ニュースのメンバーフィルター
    document.getElementById('member-filter-news').addEventListener('change', (e) => {
        state.filters.member = e.target.value;
        filterNewsArticles();
    });
    
    // ブログのメンバーフィルター
    document.getElementById('member-filter-blog').addEventListener('change', (e) => {
        state.filters.blogMember = e.target.value;
        filterBlogEntries();
    });
}

// もっと読み込むボタンのイベントリスナー設定
function setupLoadMoreButtons() {
    // YouTubeビデオをもっと読み込む
    document.getElementById('load-more-videos').addEventListener('click', () => {
        fetchMoreYouTubeVideos();
    });
    
    // ニュース記事をもっと読み込む
    document.getElementById('load-more-news').addEventListener('click', () => {
        state.newsPage++;
        fetchNewsArticles(true);
    });
    
    // ブログ記事をもっと読み込む
    document.getElementById('load-more-blog').addEventListener('click', () => {
        fetchMoreBlogEntries();
    });
}

// YouTubeビデオをRSSから取得（メインページ用）
function fetchYouTubeVideosRSS() {
    showLoading('youtube-videos');
    
    // 日向坂46 OFFICIAL YouTube CHANNELのRSS
    const officialChannelRssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${HINATAZAKA_CHANNELS.official}`;
    // 日向坂ちゃんねるのRSS
    const fanChannelRssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${HINATAZAKA_CHANNELS.channel}`;
    
    // CORSプロキシ
    const corsProxy = 'https://api.allorigins.win/get?url=';
    
    Promise.all([
        fetchRssFeed(corsProxy + encodeURIComponent(officialChannelRssUrl)),
        fetchRssFeed(corsProxy + encodeURIComponent(fanChannelRssUrl))
    ])
    .then(([officialVideos, fanVideos]) => {
        // 動画を合併
        state.youtubeVideos = [...officialVideos, ...fanVideos];
        
        // 日付順にソート
        state.youtubeVideos.sort((a, b) => b.publishedAt - a.publishedAt);
        
        renderYouTubeVideos();
    })
    .catch(error => {
        console.error('YouTube RSS エラー:', error);
        document.getElementById('youtube-videos').innerHTML = `<div class="error">動画の読み込みに失敗しました。${error.message}</div>`;
        document.getElementById('load-more-videos').style.display = 'none';
    });
}

// RSSフィードを取得して解析
async function fetchRssFeed(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, 'text/xml');
        const entries = xml.querySelectorAll('entry');
        
        const videos = [];
        entries.forEach(entry => {
            const id = entry.querySelector('yt\\:videoId').textContent;
            const title = entry.querySelector('title').textContent;
            const channelName = entry.querySelector('author name').textContent;
            const publishedAt = new Date(entry.querySelector('published').textContent);
            
            // サムネイルURLを取得
            const mediaGroup = entry.querySelector('media\\:group');
            let thumbnailUrl = '';
            if (mediaGroup) {
                const mediaThumbnail = mediaGroup.querySelector('media\\:thumbnail');
                if (mediaThumbnail) {
                    thumbnailUrl = mediaThumbnail.getAttribute('url');
                }
            }
            
            videos.push({
                id,
                title,
                channelName,
                publishedAt,
                thumbnailUrl: thumbnailUrl || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
            });
        });
        
        return videos;
    } catch (error) {
        console.error('RSS feed error:', error);
        return [];
    }
}

// もっと多くのYouTubeビデオを読み込む
function fetchMoreYouTubeVideos() {
    // RSSでは"もっと読み込む"機能が限定的なため、実装は省略
    document.getElementById('load-more-videos').style.display = 'none';
    document.getElementById('youtube-videos').innerHTML += '<div class="info-message">RSSフィードでは追加の動画を読み込めません。</div>';
}

// YouTubeビデオを表示
function renderYouTubeVideos() {
    const container = document.getElementById('youtube-videos');
    
    if (state.youtubeVideos.length === 0) {
        container.innerHTML = '<div class="no-results">動画が見つかりませんでした。</div>';
        document.getElementById('load-more-videos').style.display = 'none';
        return;
    }
    
    let html = '';
    state.youtubeVideos.forEach(video => {
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = video.publishedAt.toLocaleDateString('ja-JP', dateOptions);
        
        html += `
            <div class="video-card">
                <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank" rel="noopener noreferrer">
                    <div class="video-thumbnail">
                        <img src="${video.thumbnailUrl}" alt="${video.title}">
                    </div>
                    <div class="video-info">
                        <div class="video-title">${video.title}</div>
                        <div class="video-channel">${video.channelName}</div>
                        <div class="video-date">${formattedDate}</div>
                    </div>
                </a>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // YouTubeのRSSはページネーションがないので、ボタンを非表示
    document.getElementById('load-more-videos').style.display = 'none';
}

// YouTubeビデオを取得（ホームページ用）
function fetchYouTubeVideosForHome() {
    showLoading('home-latest-videos');
    
    // 日向坂46 OFFICIAL YouTube CHANNELのRSS
    const officialChannelRssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${HINATAZAKA_CHANNELS.official}`;
    
    // CORSプロキシ
    const corsProxy = 'https://api.allorigins.win/get?url=';
    
    fetchRssFeed(corsProxy + encodeURIComponent(officialChannelRssUrl))
    .then(videos => {
        if (videos.length === 0) {
            document.getElementById('home-latest-videos').innerHTML = '<div class="no-results">動画が見つかりませんでした。</div>';
            return;
        }
        
        let html = '';
        videos.slice(0, 4).forEach(video => {
            const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = video.publishedAt.toLocaleDateString('ja-JP', dateOptions);
            
            html += `
                <div class="video-card">
                    <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank" rel="noopener noreferrer">
                        <div class="video-thumbnail">
                            <img src="${video.thumbnailUrl}" alt="${video.title}">
                        </div>
                        <div class="video-info">
                            <div class="video-title">${video.title}</div>
                            <div class="video-channel">${video.channelName}</div>
                            <div class="video-date">${formattedDate}</div>
                        </div>
                    </a>
                </div>
            `;
        });
        
        document.getElementById('home-latest-videos').innerHTML = html;
    })
    .catch(error => {
        console.error('YouTube RSS エラー (ホーム):', error);
        document.getElementById('home-latest-videos').innerHTML = `<div class="error">動画の読み込みに失敗しました。${error.message}</div>`;
    });
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
        return b.rawDate - a.rawDate;
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

// ブログ記事を取得する
async function fetchBlogEntries() {
    showLoading('blog-entries');
    
    try {
        // 各メンバーごとに最新のブログ記事を取得
        const entries = [];
        
        // テスト用に固定データを使用（実際にはAPIが必要）
        // 実際のAPIが存在しない場合、このようなサンプルデータを使用
        for (const [member, url] of Object.entries(BLOG_URLS)) {
            entries.push({
                member: member,
                title: `${member}の最新ブログ`,
                url: url,
                date: new Date(),
                content: `${member}の最新ブログ内容がここに表示されます。ブログの内容はWEBスクレイピングを使用して取得する必要があります。`
            });
        }
        
        state.blogEntries = entries;
        filterBlogEntries();
    } catch (error) {
        console.error('ブログ取得エラー:', error);
        document.getElementById('blog-entries').innerHTML = '<div class="error">ブログの読み込みに失敗しました。</div>';
        document.getElementById('load-more-blog').style.display = 'none';
    }
}

// メンバーフィルターを適用してブログ記事を表示
function filterBlogEntries() {
    const memberFilter = state.filters.blogMember || 'all';
    let filteredEntries = state.blogEntries;
    
    if (memberFilter !== 'all') {
        filteredEntries = state.blogEntries.filter(entry => entry.member === memberFilter);
    }
    
    renderBlogEntries(filteredEntries);
}

// ブログ記事を表示
function renderBlogEntries(entries) {
    const container = document.getElementById('blog-entries');
    
    if (entries.length === 0) {
        container.innerHTML = '<div class="no-results">該当するブログが見つかりませんでした。</div>';
        document.getElementById('load-more-blog').style.display = 'none';
        return;
    }
    
    let html = '';
    entries.forEach(entry => {
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = entry.date.toLocaleDateString('ja-JP', dateOptions);
        
        html += `
            <div class="blog-card">
                <div class="blog-content">
                    <div class="blog-member">${entry.member}</div>
                    <a href="${entry.url}" target="_blank" rel="noopener noreferrer">
                        <div class="blog-title">${entry.title}</div>
                    </a>
                    <div class="blog-date">${formattedDate}</div>
                    <div class="blog-excerpt">${entry.content}</div>
                    <a href="${entry.url}" target="_blank" rel="noopener noreferrer" class="read-more">続きを読む</a>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // ブログのAPIがないため「もっと読み込む」は非表示
    document.getElementById('load-more-blog').style.display = 'none';
}

// ホーム用のブログエントリーを取得
function fetchBlogEntriesForHome() {
    showLoading('home-latest-blog');
    
    try {
        // テスト用に固定データを使用（サンプル）
        const entries = [
            {
                member: '小坂菜緒',
                title: '小坂菜緒のブログ',
                url: BLOG_URLS['小坂菜緒'],
                date: new Date(),
                content: '最新のブログ内容がここに表示されます。'
            },
            {
                member: '河田陽菜',
                title: '河田陽菜のブログ',
                url: BLOG_URLS['河田陽菜'],
                date: new Date(),
                content: '最新のブログ内容がここに表示されます。'
            },
            {
                member: '金村美玖',
                title: '金村美玖のブログ',
                url: BLOG_URLS['金村美玖'],
                date: new Date(),
                content: '最新のブログ内容がここに表示されます。'
            }
        ];
        
        let html = '';
        entries.forEach(entry => {
            const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = entry.date.toLocaleDateString('ja-JP', dateOptions);
            
            html += `
                <div class="blog-card">
                    <div class="blog-content">
                        <div class="blog-member">${entry.member}</div>
                        <a href="${entry.url}" target="_blank" rel="noopener noreferrer">
                            <div class="blog-title">${entry.title}</div>
                        </a>
                        <div class="blog-date">${formattedDate}</div>
                        <div class="blog-excerpt">${entry.content}</div>
                        <a href="${entry.url}" target="_blank" rel="noopener noreferrer" class="read-more">続きを読む</a>
                    </div>
                </div>
            `;
        });
        
        document.getElementById('home-latest-blog').innerHTML = html;
    } catch (error) {
        console.error('ホームブログ取得エラー:', error);
        document.getElementById('home-latest-blog').innerHTML = '<div class="error">ブログの読み込みに失敗しました。</div>';
    }
}

// もっと多くのブログエントリーを読み込む
function fetchMoreBlogEntries() {
    // ブログAPIがないため機能しない
    document.getElementById('load-more-blog').style.display = 'none';
}

// ヘルパー関数：ローディング表示
function showLoading(containerId) {
    document.getElementById(containerId).innerHTML = '<div class="loading">読み込み中...</div>';
}

// ヘルパー関数：エラーメッセージ表示
function showErrorMessage(containerId, message) {
    document.getElementById(containerId).innerHTML = `<div class="error">${message}</div>`;
}