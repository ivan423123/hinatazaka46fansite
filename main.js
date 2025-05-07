// メインJavaScript - サイト全体の機能を統合

// グローバルな状態
let currentNewsPage = 1;
let currentVideosPage = 1;
let currentBlogsPage = 1;
const itemsPerPage = 5;

// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', () => {
  // ナビゲーションの設定
  setupNavigation();
  
  // メンバーフィルターの設定
  setupMemberFilters();
  
  // ホームページのコンテンツを読み込む
  loadHomePageContent();
  
  // 「もっと読み込む」ボタンのイベントリスナーを設定
  setupLoadMoreButtons();
});

// ナビゲーションのセットアップ
function setupNavigation() {
  const navLinks = document.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // アクティブなリンクとページを更新
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      const pageId = link.getAttribute('data-page');
      showPage(pageId);
      
      // URLハッシュを更新
      window.location.hash = pageId;
      
      // 対応するページのコンテンツを読み込む
      loadPageContent(pageId);
    });
  });
  
  // ハッシュに基づいて初期ページを設定
  const hash = window.location.hash.substring(1);
  if (hash && document.getElementById(hash)) {
    const link = document.querySelector(`nav a[data-page="${hash}"]`);
    if (link) {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      showPage(hash);
      loadPageContent(hash);
    }
  }
}

// 指定されたページを表示し、他を非表示にする
function showPage(pageId) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => {
    page.classList.remove('active-page');
  });
  
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active-page');
  }
}

// メンバーフィルターの設定
function setupMemberFilters() {
  // ニュースのメンバーフィルターを設定
  const newsFilter = document.getElementById('news-member-filter');
  if (newsFilter) {
    HINATAZAKA_MEMBERS.forEach(member => {
      const option = document.createElement('option');
      option.value = member;
      option.textContent = member;
      newsFilter.appendChild(option);
    });
    
    newsFilter.addEventListener('change', () => {
      currentNewsPage = 1;
      loadNewsContent(newsFilter.value);
    });
  }
  
  // ブログのメンバーフィルターを設定
  const blogFilter = document.getElementById('blog-member-filter');
  if (blogFilter) {
    MEMBER_BLOGS.forEach(member => {
      const option = document.createElement('option');
      option.value = member.id;
      option.textContent = member.name;
      blogFilter.appendChild(option);
    });
    
    blogFilter.addEventListener('change', () => {
      currentBlogsPage = 1;
      loadBlogContent(blogFilter.value);
    });
  }
  
  // YouTubeのチャンネルフィルターを設定
  const youtubeFilter = document.getElementById('youtube-channel-filter');
  if (youtubeFilter) {
    youtubeFilter.addEventListener('change', () => {
      currentVideosPage = 1;
      loadYoutubeContent(youtubeFilter.value);
    });
  }
}

// 「もっと読み込む」ボタンのセットアップ
function setupLoadMoreButtons() {
  // ニュースの「もっと読み込む」ボタン
  const loadMoreNewsBtn = document.getElementById('load-more-news');
  if (loadMoreNewsBtn) {
    loadMoreNewsBtn.addEventListener('click', () => {
      currentNewsPage++;
      const memberFilter = document.getElementById('news-member-filter');
      const selectedMember = memberFilter ? memberFilter.value : 'all';
      loadNewsContent(selectedMember, true);
    });
  }
  
  // YouTubeの「もっと読み込む」ボタン
  const loadMoreVideosBtn = document.getElementById('load-more-videos');
  if (loadMoreVideosBtn) {
    loadMoreVideosBtn.addEventListener('click', () => {
      currentVideosPage++;
      const channelFilter = document.getElementById('youtube-channel-filter');
      const selectedChannel = channelFilter ? channelFilter.value : 'all';
      loadYoutubeContent(selectedChannel, true);
    });
  }
  
  // ブログの「もっと読み込む」ボタン
  const loadMoreBlogsBtn = document.getElementById('load-more-blogs');
  if (loadMoreBlogsBtn) {
    loadMoreBlogsBtn.addEventListener('click', () => {
      currentBlogsPage++;
      const memberFilter = document.getElementById('blog-member-filter');
      const selectedMember = memberFilter ? memberFilter.value : 'all';
      loadBlogContent(selectedMember, true);
    });
  }
}

// ホームページのコンテンツを読み込む
async function loadHomePageContent() {
  try {
    // 最新ニュースを取得
    const latestNewsContainer = document.getElementById('latest-news');
    if (latestNewsContainer) {
      latestNewsContainer.innerHTML = '<div class="loading">ニュースを読み込み中...</div>';
      
      const news = await getRssNews(3);
      let newsHtml = '';
      
      if (news.length > 0) {
        news.forEach(article => {
          newsHtml += generateNewsCardHtml(article);
        });
      } else {
        newsHtml = '<p>最新のニュースがありません。</p>';
      }
      
      latestNewsContainer.innerHTML = newsHtml;
    }
    
    // 最新YouTube動画を取得
    const latestVideosContainer = document.getElementById('latest-videos');
    if (latestVideosContainer) {
      latestVideosContainer.innerHTML = '<div class="loading">動画を読み込み中...</div>';
      
      const videos = await getYoutubeVideos(null, 3);
      let videosHtml = '';
      
      if (videos.length > 0) {
        videos.forEach(video => {
          videosHtml += generateVideoCardHtml(video);
        });
      } else {
        videosHtml = '<p>最新の動画がありません。</p>';
      }
      
      latestVideosContainer.innerHTML = videosHtml;
    }
    
    // 最新ブログ記事を取得
    const latestBlogsContainer = document.getElementById('latest-blogs');
    if (latestBlogsContainer) {
      latestBlogsContainer.innerHTML = '<div class="loading">ブログを読み込み中...</div>';
      
      const blogs = await getMemberBlogs(null, 3);
      let blogsHtml = '';
      
      if (blogs.length > 0) {
        blogs.forEach(blog => {
          blogsHtml += generateBlogCardHtml(blog);
        });
      } else {
        blogsHtml = '<p>最新のブログ記事がありません。</p>';
      }
      
      latestBlogsContainer.innerHTML = blogsHtml;
    }
  } catch (error) {
    console.error('Error loading home page content:', error);
    
    // エラーメッセージを表示
    const containers = ['latest-news', 'latest-videos', 'latest-blogs'];
    containers.forEach(id => {
      const container = document.getElementById(id);
      if (container) {
        container.innerHTML = '<p>コンテンツの読み込み中にエラーが発生しました。</p>';
      }
    });
  }
}

// 特定のページのコンテンツを読み込む
function loadPageContent(pageId) {
    switch (pageId) {
      case 'news':
        const newsFilter = document.getElementById('news-member-filter');
        const selectedMember = newsFilter ? newsFilter.value : 'all';
        loadNewsContent(selectedMember);
        break;
        
      case 'youtube':
        const channelFilter = document.getElementById('youtube-channel-filter');
        const selectedChannel = channelFilter ? channelFilter.value : 'all';
        loadYoutubeContent(selectedChannel);
        break;
        
      case 'blog':
        const blogFilter = document.getElementById('blog-member-filter');
        const selectedBlogMember = blogFilter ? blogFilter.value : 'all';
        loadBlogContent(selectedBlogMember);
        break;
  }
}

// ニュースコンテンツを読み込む
async function loadNewsContent(memberFilter = 'all', append = false) {
  try {
    const newsGrid = document.getElementById('news-grid');
    
    if (!append) {
      newsGrid.innerHTML = '<div class="loading">ニュースを読み込み中...</div>';
    }
    
    const limit = itemsPerPage;
    const offset = (currentNewsPage - 1) * itemsPerPage;
    const totalLimit = offset + limit;
    
    // すべてのニュースを取得（十分な数）
    const allNews = await getRssNews(totalLimit + 10);
    
    // メンバーでフィルタリング
    const filteredNews = memberFilter === 'all'
      ? allNews
      : filterByMember(allNews, memberFilter);
    
    // 現在のページに表示する記事
    const pageNews = filteredNews.slice(offset, totalLimit);
    
    let newsHtml = '';
    
    if (pageNews.length > 0) {
      pageNews.forEach(article => {
        newsHtml += generateNewsCardHtml(article);
      });
      
      if (append) {
        // ローディング要素を削除
        const loadingEl = newsGrid.querySelector('.loading');
        if (loadingEl) {
          loadingEl.remove();
        }
        
        // 既存のコンテンツに追加
        newsGrid.insertAdjacentHTML('beforeend', newsHtml);
      } else {
        newsGrid.innerHTML = newsHtml;
      }
      
      // もっと読み込むボタンの表示/非表示
      const loadMoreBtn = document.getElementById('load-more-news');
      if (loadMoreBtn) {
        loadMoreBtn.style.display = filteredNews.length > totalLimit ? 'block' : 'none';
      }
    } else {
      if (!append) {
        newsGrid.innerHTML = '<p>該当するニュースがありません。</p>';
      }
      
      // もっと読み込むボタンを非表示
      const loadMoreBtn = document.getElementById('load-more-news');
      if (loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Error loading news content:', error);
    
    const newsGrid = document.getElementById('news-grid');
    if (newsGrid && !append) {
      newsGrid.innerHTML = '<p>ニュースの読み込み中にエラーが発生しました。</p>';
    }
  }
}

// YouTube動画を読み込む
async function loadYoutubeContent(channelFilter = 'all', append = false) {
  try {
    const videoGrid = document.getElementById('video-grid');
    
    if (!append) {
      videoGrid.innerHTML = '<div class="loading">動画を読み込み中...</div>';
    }
    
    const limit = itemsPerPage;
    const offset = (currentVideosPage - 1) * itemsPerPage;
    const totalLimit = offset + limit;
    
    // 動画を取得
    const videos = await getYoutubeVideos(channelFilter, totalLimit + 5);
    
    // 現在のページに表示する動画
    const pageVideos = videos.slice(offset, totalLimit);
    
    let videosHtml = '';
    
    if (pageVideos.length > 0) {
      pageVideos.forEach(video => {
        videosHtml += generateVideoCardHtml(video);
      });
      
      if (append) {
        // ローディング要素を削除
        const loadingEl = videoGrid.querySelector('.loading');
        if (loadingEl) {
          loadingEl.remove();
        }
        
        // 既存のコンテンツに追加
        videoGrid.insertAdjacentHTML('beforeend', videosHtml);
      } else {
        videoGrid.innerHTML = videosHtml;
      }
      
      // もっと読み込むボタンの表示/非表示
      const loadMoreBtn = document.getElementById('load-more-videos');
      if (loadMoreBtn) {
        loadMoreBtn.style.display = videos.length > totalLimit ? 'block' : 'none';
      }
    } else {
      if (!append) {
        videoGrid.innerHTML = '<p>該当する動画がありません。</p>';
      }
      
      // もっと読み込むボタンを非表示
      const loadMoreBtn = document.getElementById('load-more-videos');
      if (loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Error loading YouTube content:', error);
    
    const videoGrid = document.getElementById('video-grid');
    if (videoGrid && !append) {
      videoGrid.innerHTML = '<p>動画の読み込み中にエラーが発生しました。</p>';
    }
  }
}

// ブログコンテンツを読み込む
async function loadBlogContent(memberFilter = 'all', append = false) {
  try {
    const blogGrid = document.getElementById('blog-grid');
    
    if (!append) {
      blogGrid.innerHTML = '<div class="loading">ブログを読み込み中...</div>';
    }
    
    const limit = itemsPerPage;
    const offset = (currentBlogsPage - 1) * itemsPerPage;
    const totalLimit = offset + limit;
    
    // ブログ記事を取得
    const blogs = await getMemberBlogs(memberFilter, totalLimit + 5);
    
    // 現在のページに表示する記事
    const pageBlogs = blogs.slice(offset, totalLimit);
    
    let blogsHtml = '';
    
    if (pageBlogs.length > 0) {
      pageBlogs.forEach(blog => {
        blogsHtml += generateBlogCardHtml(blog);
      });
      
      if (append) {
        // ローディング要素を削除
        const loadingEl = blogGrid.querySelector('.loading');
        if (loadingEl) {
          loadingEl.remove();
        }
        
        // 既存のコンテンツに追加
        blogGrid.insertAdjacentHTML('beforeend', blogsHtml);
      } else {
        blogGrid.innerHTML = blogsHtml;
      }
      
      // もっと読み込むボタンの表示/非表示
      const loadMoreBtn = document.getElementById('load-more-blogs');
      if (loadMoreBtn) {
        loadMoreBtn.style.display = blogs.length > totalLimit ? 'block' : 'none';
      }
    } else {
      if (!append) {
        blogGrid.innerHTML = '<p>該当するブログ記事がありません。</p>';
      }
      
      // もっと読み込むボタンを非表示
      const loadMoreBtn = document.getElementById('load-more-blogs');
      if (loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Error loading blog content:', error);
    
    const blogGrid = document.getElementById('blog-grid');
    if (blogGrid && !append) {
      blogGrid.innerHTML = '<p>ブログの読み込み中にエラーが発生しました。</p>';
    }
  }
}

// ページ切り替えの処理に聖地を追加
function switchPage(pageId) {
    // ...existing code...
    if (pageId === 'sacred-places') {
        document.querySelector('#sacred-places').classList.add('active-page');
    }
    // ...existing code...
}