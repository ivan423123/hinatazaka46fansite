// ニュースサービス - RSSフィードからニュース記事を取得するための機能

// CORSプロキシのURL (RSSフィードを取得するために必要)
const NEWS_CORS_PROXY = 'https://api.allorigins.win/get?url=';
const HINATAZAKA_NEWS_RSS = 'https://news.google.com/rss/search?q=%E6%97%A5%E5%90%91%E5%9D%8246&hl=ja&gl=JP&ceid=JP:ja';

// 日向坂46メンバーの一覧
const HINATAZAKA_MEMBERS = [
  '河田陽菜', '金村美玖', '富田鈴花', '松田好花', '小坂菜緒',
　'上村ひなの', '髙橋未来虹', '森本茉莉', '山口陽世',
  '石塚瑶季','清水理央','正源司陽子','竹内希来里','平尾帆夏',
  '平岡海月','藤嶌果歩','宮地すみれ','山下葉留花','渡辺莉奈',
  '大田美月','大野愛実','片山紗希','蔵盛妃那乃','坂井新奈',
  '佐藤優羽','下田衣珠季','高井俐香','鶴崎仁香','松尾桜'
];

// RSSフィードからニュース記事を取得する関数
async function getRssNews(limit = 10) {
  try {
    const proxyUrl = `${NEWS_CORS_PROXY}${encodeURIComponent(HINATAZAKA_NEWS_RSS)}`;
    console.log('Fetching news from:', proxyUrl);

    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents, 'text/xml');
    const items = xml.querySelectorAll('item');

    const articles = [];
    let count = 0;

     for (let i = 0; i < items.length && count < limit; i++) {
      try {
        const item = items[i];
        const title = item.querySelector('title')?.textContent;
        const link = item.querySelector('link')?.textContent;
        const pubDate = item.querySelector('pubDate')?.textContent;
        const description = item.querySelector('description')?.textContent;
        const source = item.querySelector('source')?.textContent || 'Google News';

        if (title && link) {
          // HTML文字列をエスケープする
          const cleanDescription = description
            ? description.replace(/<\/?[^>]+(>|$)/g, '').replace(/&nbsp;/g, ' ').trim()
            : '';

          // 日付をフォーマット
          const date = pubDate ? new Date(pubDate) : new Date();
          const formattedDate = date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          articles.push({
            title,
            link,
            pubDate: formattedDate,
            description: cleanDescription,
            source,
            rawDate: date, // ソート用
            memberTags: extractMemberTags({ title, description: cleanDescription })
          });
          
          count++;
        }
      } catch (err) {
        console.error('Error parsing news item:', err);
      }
    }

    // 日付の新しい順に並べ替え
    articles.sort((a, b) => b.rawDate - a.rawDate);

    return articles;
  } catch (error) {
    console.error('Error fetching RSS news:', error);
    throw error;
  }
}

// 記事からメンバータグを抽出
function extractMemberTags(article) {
  const tags = [];

  HINATAZAKA_MEMBERS.forEach(member => {
    if (article.title.includes(member) ||
        (article.description && article.description.includes(member))) {
      tags.push(member);
    }
  });

  return tags;
}

// メンバーでフィルタリング
function filterByMember(articles, memberName) {
  if (!memberName || memberName === 'all') {
    return articles;
  }

  return articles.filter(article =>
    article.title.includes(memberName) ||
    (article.description && article.description.includes(memberName))
  );
}

// 記事のHTMLを生成
function generateNewsCardHtml(article) {
  const tagsHtml = article.memberTags && article.memberTags.length > 0
    ? `<div class="news-tags">
        ${article.memberTags.map(tag => `<span class="news-tag">${tag}</span>`).join('')}
       </div>`
    : '';

  return `
    <div class="news-card">
      <div class="news-content">
        <a href="${article.link}" target="_blank" rel="noopener noreferrer">
          <div class="news-title">${article.title}</div>
        </a>
        <div class="news-source">${article.source}</div>
        <div class="news-date">${article.pubDate}</div>
        ${article.description ? `<div class="news-description">${article.description}</div>` : ''}
        ${tagsHtml}
      </div>
    </div>
  `;
}