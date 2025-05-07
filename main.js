// メインJavaScript - サイト全体の機能を統合

// グローバルな状態
let currentNewsPage = 1;
let currentVideosPage = 1;
let currentBlogsPage = 1;
let currentReactionsPage = 1; // 反応集の現在のページ
const itemsPerPage = 5; // ニュース、動画、ブログのデフォルト表示件数
const reactionsPerPage = 10; // 反応集の1ページあたりの表示件数

let allReactionsCache = []; // フィルタリング/ソート用に全反応集データをキャッシュ
let hinatazakaMembersForFilter = []; // フィルター用のメンバーリスト (news-service.jsから取得想定)

// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', async () => {
  // ナビゲーションの設定
  setupNavigation();
  
  // メンバーフィルターの設定
  // HINATAZAKA_MEMBERS や MEMBER_BLOGS がグローバルに利用可能になった後に呼び出す
  await setupMemberFilters(); 
  
  // ホームページのコンテンツを読み込む
  loadHomePageContent();
  
  // 「もっと読み込む」ボタンのイベントリスナーを設定
  setupLoadMoreButtons();

  // ハッシュに基づいて初期ページを設定
  const hash = window.location.hash.substring(1);
  if (hash && document.getElementById(hash)) {
    const link = document.querySelector(`nav a[data-page="${hash}"]`);
    if (link) {
      document.querySelectorAll('nav a').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      showPage(hash);
      loadPageContent(hash); // 初期ページコンテンツ読み込み
    }
  } else {
    // デフォルトでホームページを表示
    const homeLink = document.querySelector('nav a[data-page="home"]');
    if (homeLink) homeLink.classList.add('active');
    showPage('home');
  }
});

// ナビゲーションのセットアップ
function setupNavigation() {
  const navLinks = document.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      const pageId = link.getAttribute('data-page');
      showPage(pageId);
      
      window.location.hash = pageId === 'home' ? '' : pageId;
      
      if (pageId !== 'home') { // ホームは専用のロード関数があるので除外
        loadPageContent(pageId);
      }
    });
  });
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
async function setupMemberFilters() {
  // news-service.js の HINATAZAKA_MEMBERS を取得 (グローバル変数と仮定)
  if (typeof HINATAZAKA_MEMBERS !== 'undefined' && HINATAZAKA_MEMBERS.length > 0) {
    hinatazakaMembersForFilter = HINATAZAKA_MEMBERS;
  } else {
    console.warn('HINATAZAKA_MEMBERS is not available for filters. Using fallback.');
    // フォールバックメンバーリスト (news-service.js と同期させるのが望ましい)
    hinatazakaMembersForFilter = ['加藤史帆', '齊藤京子', '佐々木久美', '佐々木美玲', '高本彩花', '東村芽依', '金村美玖', '河田陽菜', '小坂菜緒', '富田鈴花', '丹生明里', '濱岸ひより', '松田好花', '上村ひなの', '髙橋未来虹', '森本茉莉', '山口陽世', '石塚瑶季', '岸帆夏', '小西夏菜実', '清水理央', '正源司陽子', '竹内希来里', '平尾帆夏', '平岡海月', '藤嶌果歩', '宮地すみれ', '山下葉留花', '渡辺莉奈'];
  }

  // ニュースのメンバーフィルター
  const newsFilter = document.getElementById('news-member-filter');
  if (newsFilter) {
    hinatazakaMembersForFilter.forEach(member => {
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
  
  // ブログのメンバーフィルター
  const blogFilter = document.getElementById('blog-member-filter');
  if (blogFilter && typeof MEMBER_BLOGS !== 'undefined') { // MEMBER_BLOGS の存在確認
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
  
  // YouTubeのチャンネルフィルター
  const youtubeFilter = document.getElementById('youtube-channel-filter');
  if (youtubeFilter) {
    // YOUTUBE_CHANNELS は youtube-service.js で定義されていると仮定
    if (typeof YOUTUBE_CHANNELS !== 'undefined') {
        YOUTUBE_CHANNELS.forEach(channel => {
            const option = document.createElement('option');
            option.value = channel.id;
            option.textContent = channel.name;
            youtubeFilter.appendChild(option);
        });
    }
    youtubeFilter.addEventListener('change', () => {
      currentVideosPage = 1;
      loadYoutubeContent(youtubeFilter.value);
    });
  }

  // 反応集のメンバーフィルター
  const reactionsFilter = document.getElementById('reactions-member-filter');
  if (reactionsFilter) {
    hinatazakaMembersForFilter.forEach(member => {
      const option = document.createElement('option');
      option.value = member; // 名前でフィルタリング
      option.textContent = member;
      reactionsFilter.appendChild(option);
    });
    reactionsFilter.addEventListener('change', () => {
      currentReactionsPage = 1;
      const sortOrder = document.getElementById('reactions-sort-order').value;
      loadReactionsContent(reactionsFilter.value, sortOrder);
    });
  }

  // 反応集のソート順フィルター
  const reactionsSortOrderSelect = document.getElementById('reactions-sort-order');
  if (reactionsSortOrderSelect) {
      reactionsSortOrderSelect.addEventListener('change', () => {
          const memberFilterValue = document.getElementById('reactions-member-filter').value;
          loadReactionsContent(memberFilterValue, reactionsSortOrderSelect.value);
      });
  }
}

// 「もっと読み込む」ボタンのセットアップ
function setupLoadMoreButtons() {
  const loadMoreNewsBtn = document.getElementById('load-more-news');
  if (loadMoreNewsBtn) {
    loadMoreNewsBtn.addEventListener('click', () => {
      currentNewsPage++;
      const memberFilter = document.getElementById('news-member-filter').value;
      loadNewsContent(memberFilter, true);
    });
  }
  
  const loadMoreVideosBtn = document.getElementById('load-more-videos');
  if (loadMoreVideosBtn) {
    loadMoreVideosBtn.addEventListener('click', () => {
      currentVideosPage++;
      const channelFilter = document.getElementById('youtube-channel-filter').value;
      loadYoutubeContent(channelFilter, true);
    });
  }
  
  const loadMoreBlogsBtn = document.getElementById('load-more-blogs');
  if (loadMoreBlogsBtn) {
    loadMoreBlogsBtn.addEventListener('click', () => {
      currentBlogsPage++;
      const memberFilter = document.getElementById('blog-member-filter').value;
      loadBlogContent(memberFilter, true);
    });
  }

  const loadMoreReactionsBtn = document.getElementById('load-more-reactions');
  if (loadMoreReactionsBtn) {
    loadMoreReactionsBtn.addEventListener('click', () => {
      currentReactionsPage++;
      const memberFilter = document.getElementById('reactions-member-filter').value;
      const sortOrder = document.getElementById('reactions-sort-order').value;
      loadReactionsContent(memberFilter, sortOrder, true); // append = true
    });
  }
}

// ホームページのコンテンツを読み込む
async function loadHomePageContent() {
  try {
    // 最新ニュース (news-service.js の関数を利用)
    const latestNewsContainer = document.getElementById('latest-news');
    if (latestNewsContainer && typeof getRssNews === 'function') {
      latestNewsContainer.innerHTML = '<div class="loading">ニュースを読み込み中...</div>';
      const news = await getRssNews(3); // 3件取得
      let newsHtml = '';
      if (news.length > 0) {
        news.forEach(article => newsHtml += generateNewsCardHtml(article));
      } else {
        newsHtml = '<p>最新のニュースがありません。</p>';
      }
      latestNewsContainer.innerHTML = newsHtml;
    }
    
    // 最新YouTube動画 (youtube-service.js の関数を利用)
    const latestVideosContainer = document.getElementById('latest-videos');
    if (latestVideosContainer && typeof getYoutubeVideos === 'function') {
      latestVideosContainer.innerHTML = '<div class="loading">動画を読み込み中...</div>';
      const videos = await getYoutubeVideos(null, 3); // 全チャンネルから3件
      let videosHtml = '';
      if (videos.length > 0) {
        videos.forEach(video => videosHtml += generateVideoCardHtml(video));
      } else {
        videosHtml = '<p>最新の動画がありません。</p>';
      }
      latestVideosContainer.innerHTML = videosHtml;
    }
    
    // 最新ブログ記事 (blog-service.js の関数を利用)
    const latestBlogsContainer = document.getElementById('latest-blogs');
    if (latestBlogsContainer && typeof getMemberBlogs === 'function') {
      latestBlogsContainer.innerHTML = '<div class="loading">ブログを読み込み中...</div>';
      const blogs = await getMemberBlogs(null, 3); // 全メンバーから3件
      let blogsHtml = '';
      if (blogs.length > 0) {
        blogs.forEach(blog => blogsHtml += generateBlogCardHtml(blog));
      } else {
        blogsHtml = '<p>最新のブログ記事がありません。</p>';
      }
      latestBlogsContainer.innerHTML = blogsHtml;
    }
  } catch (error) {
    console.error('Error loading home page content:', error);
    ['latest-news', 'latest-videos', 'latest-blogs'].forEach(id => {
      const container = document.getElementById(id);
      if (container) container.innerHTML = '<p>コンテンツの読み込み中にエラーが発生しました。</p>';
    });
  }
}

// 特定のページのコンテンツを読み込む
function loadPageContent(pageId) {
    switch (pageId) {
      case 'news':
        const newsFilter = document.getElementById('news-member-filter');
        const selectedNewsMember = newsFilter ? newsFilter.value : 'all';
        loadNewsContent(selectedNewsMember);
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
      case 'reactions':
        const reactionsMemberFilter = document.getElementById('reactions-member-filter');
        const reactionsSortOrder = document.getElementById('reactions-sort-order');
        const selectedReactionMember = reactionsMemberFilter ? reactionsMemberFilter.value : 'all';
        const selectedReactionSort = reactionsSortOrder ? reactionsSortOrder.value : 'newest';
        loadReactionsContent(selectedReactionMember, selectedReactionSort);
        break;
      // 'sacred-places' は静的コンテンツか、専用の初期化関数がある場合はここで呼び出す
      // case 'sacred-places':
      //   // initMap(); // 例: マップ初期化関数
      //   break;
  }
}

// ニュースコンテンツを読み込む (news-service.js の関数を利用)
async function loadNewsContent(memberFilter = 'all', append = false) {
  try {
    const newsGrid = document.getElementById('news-grid');
    if (!newsGrid || typeof getRssNews !== 'function' || typeof generateNewsCardHtml !== 'function' || typeof filterByMember !== 'function') return;

    if (!append) {
      newsGrid.innerHTML = '<div class="loading">ニュースを読み込み中...</div>';
      currentNewsPage = 1;
    }
    
    const limit = itemsPerPage;
    const offset = (currentNewsPage - 1) * itemsPerPage;
    
    // APIから取得する記事数を多めに設定して、フィルタリング後に十分な数が残るようにする
    // ただし、APIの制限やパフォーマンスも考慮する
    const fetchLimit = offset + limit + 10; // ページネーション分 +α
    const allNews = await getRssNews(fetchLimit); 
    
    const filteredNews = filterByMember(allNews, memberFilter);
    const pageNews = filteredNews.slice(offset, offset + limit);
    
    let newsHtml = '';
    if (pageNews.length > 0) {
      pageNews.forEach(article => newsHtml += generateNewsCardHtml(article));
      if (append) {
        const loadingEl = newsGrid.querySelector('.loading');
        if (loadingEl) loadingEl.remove();
        newsGrid.insertAdjacentHTML('beforeend', newsHtml);
      } else {
        newsGrid.innerHTML = newsHtml;
      }
    } else if (!append) {
      newsGrid.innerHTML = '<p>該当するニュースがありません。</p>';
    }

    const loadMoreBtn = document.getElementById('load-more-news');
    if (loadMoreBtn) {
      // offset + limit が filteredNews の総数より小さい場合に「もっと読み込む」を表示
      loadMoreBtn.style.display = (offset + limit < filteredNews.length) ? 'block' : 'none';
    }

  } catch (error) {
    console.error('Error loading news content:', error);
    const newsGrid = document.getElementById('news-grid');
    if (newsGrid && !append) newsGrid.innerHTML = '<p>ニュースの読み込み中にエラーが発生しました。</p>';
  }
}

// YouTube動画を読み込む (youtube-service.js の関数を利用)
async function loadYoutubeContent(channelFilter = 'all', append = false) {
  try {
    const videoGrid = document.getElementById('video-grid');
    if (!videoGrid || typeof getYoutubeVideos !== 'function' || typeof generateVideoCardHtml !== 'function') return;

    if (!append) {
      videoGrid.innerHTML = '<div class="loading">動画を読み込み中...</div>';
      currentVideosPage = 1;
    }
    
    const limit = itemsPerPage;
    const offset = (currentVideosPage - 1) * itemsPerPage;
    const fetchLimit = offset + limit + 5; // ページネーション分 +α
    
    const videos = await getYoutubeVideos(channelFilter, fetchLimit);
    const pageVideos = videos.slice(offset, offset + limit);
    
    let videosHtml = '';
    if (pageVideos.length > 0) {
      pageVideos.forEach(video => videosHtml += generateVideoCardHtml(video));
      if (append) {
        const loadingEl = videoGrid.querySelector('.loading');
        if (loadingEl) loadingEl.remove();
        videoGrid.insertAdjacentHTML('beforeend', videosHtml);
      } else {
        videoGrid.innerHTML = videosHtml;
      }
    } else if (!append) {
      videoGrid.innerHTML = '<p>該当する動画がありません。</p>';
    }

    const loadMoreBtn = document.getElementById('load-more-videos');
    if (loadMoreBtn) {
      loadMoreBtn.style.display = (offset + limit < videos.length) ? 'block' : 'none';
    }

  } catch (error) {
    console.error('Error loading YouTube content:', error);
    const videoGrid = document.getElementById('video-grid');
    if (videoGrid && !append) videoGrid.innerHTML = '<p>動画の読み込み中にエラーが発生しました。</p>';
  }
}

// ブログコンテンツを読み込む (blog-service.js の関数を利用)
async function loadBlogContent(memberFilter = 'all', append = false) {
  try {
    const blogGrid = document.getElementById('blog-grid');
    if (!blogGrid || typeof getMemberBlogs !== 'function' || typeof generateBlogCardHtml !== 'function') return;

    if (!append) {
      blogGrid.innerHTML = '<div class="loading">ブログを読み込み中...</div>';
      currentBlogsPage = 1;
    }
    
    const limit = itemsPerPage;
    const offset = (currentBlogsPage - 1) * itemsPerPage;
    const fetchLimit = offset + limit + 5; // ページネーション分 +α
    
    const blogs = await getMemberBlogs(memberFilter, fetchLimit);
    const pageBlogs = blogs.slice(offset, offset + limit);
    
    let blogsHtml = '';
    if (pageBlogs.length > 0) {
      pageBlogs.forEach(blog => blogsHtml += generateBlogCardHtml(blog));
      if (append) {
        const loadingEl = blogGrid.querySelector('.loading');
        if (loadingEl) loadingEl.remove();
        blogGrid.insertAdjacentHTML('beforeend', blogsHtml);
      } else {
        blogGrid.innerHTML = blogsHtml;
      }
    } else if (!append) {
      blogGrid.innerHTML = '<p>該当するブログ記事がありません。</p>';
    }

    const loadMoreBtn = document.getElementById('load-more-blogs');
    if (loadMoreBtn) {
      loadMoreBtn.style.display = (offset + limit < blogs.length) ? 'block' : 'none';
    }

  } catch (error) {
    console.error('Error loading blog content:', error);
    const blogGrid = document.getElementById('blog-grid');
    if (blogGrid && !append) blogGrid.innerHTML = '<p>ブログの読み込み中にエラーが発生しました。</p>';
  }
}

// 反応集コンテンツを読み込む (reactions-service.js の関数を利用)
async function loadReactionsContent(memberFilter = 'all', sortOrder = 'newest', append = false) {
  try {
    const reactionsGrid = document.getElementById('reactions-grid');
    if (!reactionsGrid || typeof fetchReactionsFromSource !== 'function') return;

    if (!append) {
      reactionsGrid.innerHTML = '<div class="loading">反応集を読み込み中...</div>';
      currentReactionsPage = 1;
      // 初回ロード時またはフィルター/ソート変更時に全データを取得・キャッシュ
      // ただし、毎回APIを叩くのは負荷が高いので、キャッシュ戦略を考える必要がある
      // ここでは簡略化のため、フィルター/ソート変更時にも再取得する
      allReactionsCache = await fetchReactionsFromSource();
    }
    
    let itemsToDisplay = [...allReactionsCache];

    // メンバーでフィルタリング (タイトルにメンバー名が含まれるかで判定)
    if (memberFilter !== 'all') {
      itemsToDisplay = itemsToDisplay.filter(item => 
        item.title.toLowerCase().includes(memberFilter.toLowerCase())
      );
    }

    // 並び替え (reactions-service.js で rawDate を元にソート済みだが、ここで再度ソートも可能)
    itemsToDisplay.sort((a, b) => {
      if (sortOrder === 'oldest') {
        return a.rawDate - b.rawDate; // 古い順
      }
      return b.rawDate - a.rawDate; // 新しい順 (デフォルト)
    });

    const offset = (currentReactionsPage - 1) * reactionsPerPage;
    const pageReactions = itemsToDisplay.slice(offset, offset + reactionsPerPage);

    let reactionsHtml = '';
    if (pageReactions.length > 0) {
      pageReactions.forEach(reaction => {
        reactionsHtml += generateReactionCardHtml(reaction); // 専用のHTML生成関数
      });

      if (append) {
        const loadingEl = reactionsGrid.querySelector('.loading');
        if (loadingEl) loadingEl.remove();
        reactionsGrid.insertAdjacentHTML('beforeend', reactionsHtml);
      } else {
        reactionsGrid.innerHTML = reactionsHtml;
      }
    } else if (!append) {
      reactionsGrid.innerHTML = '<p>該当する反応集はありません。</p>';
    }
    
    const loadMoreBtn = document.getElementById('load-more-reactions');
    if (loadMoreBtn) {
      loadMoreBtn.style.display = (offset + reactionsPerPage < itemsToDisplay.length) ? 'block' : 'none';
    }

  } catch (error) {
    console.error('Error loading reactions content:', error);
    const reactionsGrid = document.getElementById('reactions-grid');
    if (reactionsGrid && !append) {
      reactionsGrid.innerHTML = '<p>反応集の読み込み中にエラーが発生しました。</p>';
    }
  }
}

// 反応集カードのHTMLを生成する関数
function generateReactionCardHtml(reaction) {
  // reaction.pubDate は reactions-service.js でフォーマット済み
 // reaction.title, reaction.link, reaction.thumbnailUrl
 let imageHtml = '';
 if (reaction.thumbnailUrl) {
  imageHtml = `
  <div class="reaction-item-image-container">
    <img src="${reaction.thumbnailUrl}" alt="${reaction.title}" class="reaction-item-image">
  </div>`;
 }
  return `
    <div class="reaction-item">
      ${imageHtml}
      <div class="reaction-item-content">
        <h4><a href="${reaction.link}" target="_blank" rel="noopener noreferrer">${reaction.title}</a></h4>
        <p class="date">${reaction.pubDate}</p>
      </div>
    </div>
  `;
}

// ページ切り替えの処理 (聖地マップ用に追加された部分を維持)
// function switchPage(pageId) { // この関数は setupNavigation 内の showPage に統合されているため、重複定義を避ける
//     // ...existing code...
//     if (pageId === 'sacred-places') {
//         const sacredPage = document.querySelector('#sacred-places');
//         if (sacredPage) sacredPage.classList.add('active-page');
//     }
//     // ...existing code...
// }
