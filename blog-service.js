// ブログサービス - メンバーブログ情報を取得するための機能

// CORSプロキシのURL (スクレイピングに必要)
const BLOG_CORS_PROXY = 'https://api.allorigins.win/get?url=';

// 日向坂46メンバーのブログURL
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

// メンバーブログの情報を取得する関数
async function fetchMemberBlog(member, limit = 3) {
  try {
    if (!BLOG_URLS[member]) {
      throw new Error(`${member}のブログURLが見つかりません`);
    }

    const url = BLOG_URLS[member];
    const proxyUrl = `${BLOG_CORS_PROXY}${encodeURIComponent(url)}`;
    
    console.log(`${member}のブログを取得中:`, proxyUrl);
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // HTMLをパースする
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');
    
    // ブログエントリーを抽出
    const entries = [];
    const blogEntries = doc.querySelectorAll('.l-blog__list .topic');
    
    let count = 0;
    blogEntries.forEach(entry => {
      if (count < limit) {
        try {
          const titleElement = entry.querySelector('.topic__title');
          const dateElement = entry.querySelector('.topic__date');
          const contentElement = entry.querySelector('.topic__text');
          
          if (titleElement && dateElement) {
            const title = titleElement.textContent.trim();
            const dateText = dateElement.textContent.trim();
            const content = contentElement ? contentElement.textContent.trim() : '';
            
            // 日付をパース
            // 例: "2025.05.05 10:30"
            const dateMatch = dateText.match(/(\d{4})\.(\d{2})\.(\d{2}) (\d{2}):(\d{2})/);
            let date = new Date();
            
            if (dateMatch) {
              date = new Date(
                parseInt(dateMatch[1]), // 年
                parseInt(dateMatch[2]) - 1, // 月 (0-11)
                parseInt(dateMatch[3]), // 日
                parseInt(dateMatch[4]), // 時
                parseInt(dateMatch[5])  // 分
              );
            }
            
            entries.push({
              member,
              title,
              url: url + `&date=${dateText.split(' ')[0].replace(/\./g, '')}`,
              date,
              content: content.substring(0, 150) + '...',
              rawDate: date // ソート用
            });
            
            count++;
          }
        } catch (err) {
          console.error(`${member}のブログエントリー処理中にエラー:`, err);
        }
      }
    });
    
    return entries;
  } catch (error) {
    console.error(`${member}のブログ取得中にエラー:`, error);
    return [];
  }
}

// すべてのメンバーのブログを取得
async function fetchAllMemberBlogs(limit = 3) {
  const allEntries = [];
  const members = Object.keys(BLOG_URLS);
  
  for (const member of members) {
    try {
      const entries = await fetchMemberBlog(member, limit);
      allEntries.push(...entries);
    } catch (error) {
      console.error(`${member}のブログ取得に失敗:`, error);
    }
  }
  
  // 日付順にソート
  allEntries.sort((a, b) => b.rawDate - a.rawDate);
  
  return allEntries;
}

// 特定のメンバーの最新ブログ記事を取得
async function fetchLatestBlogByMembers(memberList, limit = 1) {
  const allEntries = [];
  
  for (const member of memberList) {
    try {
      if (BLOG_URLS[member]) {
        const entries = await fetchMemberBlog(member, limit);
        allEntries.push(...entries);
      }
    } catch (error) {
      console.error(`${member}のブログ取得に失敗:`, error);
    }
  }
  
  // 日付順にソート
  allEntries.sort((a, b) => b.rawDate - a.rawDate);
  
  return allEntries;
}

// グローバルスコープで関数を公開
window.fetchMemberBlog = fetchMemberBlog;
window.fetchAllMemberBlogs = fetchAllMemberBlogs;
window.fetchLatestBlogByMembers = fetchLatestBlogByMembers;
window.BLOG_URLS = BLOG_URLS;

// ブログカードのHTMLを生成
function generateBlogCardHtml(entry) {
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = entry.date.toLocaleDateString('ja-JP', dateOptions);
  
  return `
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
}

window.generateBlogCardHtml = generateBlogCardHtml;