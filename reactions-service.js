const REACTIONS_RSS_URL = 'http://46matome.net/index.rdf';
// api.rss2json.com を使用してRSSフィードをJSONに変換
const RSS2JSON_API_URL = 'https://api.rss2json.com/v1/api.json?rss_url=';
const REACTIONS_RSS_URL_TO_FETCH = RSS2JSON_API_URL + encodeURIComponent(REACTIONS_RSS_URL);

async function fetchReactionsFromSource() {
    try {
        console.log('Fetching reactions using rss2json from:', REACTIONS_RSS_URL_TO_FETCH);
        const response = await fetch(REACTIONS_RSS_URL_TO_FETCH);
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.status !== 'ok') {
            console.error('Error from rss2json API:', data.message || 'Unknown error');
            throw new Error(`rss2json API error: ${data.message || 'Unknown error'}`);
        }

        if (!data.items || data.items.length === 0) {
            console.warn("No items found in the RSS feed via rss2json.");
            return [];
        }

        const items = data.items.map(item => {
            const title = item.title || 'タイトルなし';
            const link = item.link || '#';
            // rss2json は pubDate を "YYYY-MM-DD HH:MM:SS" 形式の文字列で返すことが多い
            // また、サムネイル画像は item.thumbnail に入ることが多い
            let thumbnailUrl = item.thumbnail || null;

            // item.thumbnail がない場合、item.content (または item.description) から最初の画像を探す
            if (!thumbnailUrl && item.content) {
                const match = item.content.match(/<img[^>]+src="([^">]+)"/);
                if (match && match[1]) {
                    thumbnailUrl = match[1];
                }
            }
            // console.log(`Title: ${title}, Thumbnail: ${thumbnailUrl}`); // デバッグ用
            const pubDateStr = item.pubDate;

            let date = new Date(); // デフォルトは現在時刻
            if (pubDateStr) {
                try {
                    // pubDateStr は "2024-03-15 09:00:00" のような形式を想定
                    date = new Date(pubDateStr);
                } catch (e) {
                    console.warn("Invalid date format from rss2json:", pubDateStr, e);
                }
            }
            const formattedDate = date.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            return { title, link, pubDate: formattedDate, rawDate: date, thumbnailUrl }; // pubDate をフォーマット済みに, rawDate を追加
        });

        return items.sort((a, b) => b.rawDate - a.rawDate); // rawDateでソート (新しい順)
    } catch (error) {
        console.error('Error in fetchReactionsFromSource (using rss2json):', error);
        return []; // エラー時は空配列を返す
    }
}

class ReactionsService {
  constructor() {
    this.currentPage = 1;
    this.isLoading = false;
    this.hasMore = true;
    this.cache = new CacheService('reactions');
    this.initialize();
  }

  initialize() {
    const loadMoreButton = document.getElementById('load-more-reactions');
    if (loadMoreButton) {
      loadMoreButton.addEventListener('click', () => this.loadMore());
    }
    // 初回読み込み
    this.loadMore();
  }

  async loadMore() {
    if (this.isLoading || !this.hasMore) return;
    
    this.isLoading = true;
    const button = document.getElementById('load-more-reactions');
    if (button) button.textContent = '読み込み中...';

    try {
      const cacheKey = `reactions_page_${this.currentPage}`;
      let data = await this.cache.get(cacheKey);

      if (!data) {
        // ここにAPIエンドポイントを設定
        const response = await fetch(`/api/reactions?page=${this.currentPage}`);
        data = await response.json();
        this.cache.set(cacheKey, data);
      }

      this.displayReactions(data.items);
      this.currentPage++;
      this.hasMore = data.hasMore;

      if (!this.hasMore && button) {
        button.style.display = 'none';
      }
    } catch (error) {
      console.error('Error loading reactions:', error);
    } finally {
      this.isLoading = false;
      const button = document.getElementById('load-more-reactions');
      if (button) button.textContent = 'もっと読み込む';
    }
  }

  displayReactions(reactions) {
    const grid = document.getElementById('reactions-grid');
    reactions.forEach(reaction => {
      const element = this.createReactionElement(reaction);
      grid.appendChild(element);
    });
  }

  createReactionElement(reaction) {
    const article = document.createElement('article');
    article.className = 'reaction-item';
    article.innerHTML = `
      <div class="reaction-item-image-container">
        <img src="${reaction.thumbnail}" class="reaction-item-image" alt="サムネイル">
      </div>
      <div class="reaction-item-content">
        <h4><a href="${reaction.url}" target="_blank">${reaction.title}</a></h4>
        <p class="date">${reaction.date}</p>
        <p class="excerpt">${reaction.excerpt}</p>
      </div>
    `;
    return article;
  }
}

// サービスの初期化
new ReactionsService();
