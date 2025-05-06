// ブログサービス - 日向坂46メンバーのブログを取得する機能

// ブログ用CORSプロキシとAPI
const BLOG_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

// メンバーブログ情報
const MEMBER_BLOGS = [
  {
    id: '12',
    name: '金村美玖',
    rssUrl: 'http://ino.xrea.jp/hinatazaka46/?id=12'
  },{
    id: '13',
    name: '河田陽菜',
    rssUrl: 'http://ino.xrea.jp/hinatazaka46/?id=13'
  },{
    id: '14',
    name: '小坂菜緒',
    rssUrl: 'http://ino.xrea.jp/hinatazaka46/?id=14'
  },{
    id: '15',
    name: '富田鈴花',
    rssUrl: 'http://ino.xrea.jp/hinatazaka46/?id=15'
  },{
    id: '18',
    name: '松田好花',
    rssUrl: 'http://ino.xrea.jp/hinatazaka46/?id=18'
  },{
    id: '21',
    name: '上村ひなの',
    rssUrl: 'http://ino.xrea.jp/hinatazaka46/?id=21'
  },{
    id: '22',
    name: '髙橋未来虹',
    rssUrl: 'http://ino.xrea.jp/hinatazaka46/?id=22'
  },{
    id: '23',
    name: '森本茉莉',
    rssUrl: 'http://ino.xrea.jp/hinatazaka46/?id=23'
  },{
    id: '24',
    name: '山口陽世',
    rssUrl: 'http://ino.xrea.jp/hinatazaka46/?id=24'
  },{
    id: '25',
    name: '石塚瑶季',
    rssUrl: 'http://ino.xrea.jp/hinatazaka46/?id=25'
  },{
    id: '27',
    name: '小西夏菜実',
    rssUrl: 'http://ino.xrea.jp/hinatazaka46/?id=27'
  },{
    id: '28',
    name: '清水理央',
    rssUrl: 'http://ino.xrea.jp/hinatazaka46/?id=28'
  },
  {
    id: '29',
    name: '正源司陽子',
    rssUrl: 'http://ino.xrea.jp/hinatazaka46/?id=29'
  },
  {
    id: '30',
    name: '竹内希来里',
    rssUrl: 'http://ino.xrea.jp/hinatazaka46/?id=30'
  },
  {
    id: '31',
    name: '平尾帆夏',
    rssUrl: 'http://ino.xrea.jp/hinatazaka46/?id=31'
  },
  {
    id: '32',
    name: '平岡海月',
    rssUrl: 'http://ino.xrea.jp/hinatazaka46/?id=32'
  },{
    id: '33',
    name: '藤嶌果歩',
    rssUrl: 'http://ino.xrea.jp/hinatazaka46/?id=33'
  },{
    id: '34',
    name: '宮地すみれ',
    rssUrl: 'http://ino.xrea.jp/hinatazaka46/?id=34'
  },{
    id: '35',
    name: '山下葉留花',
    rssUrl: 'http://ino.xrea.jp/hinatazaka46/?id=35'
  },{
    id: '36',
    name: '渡辺莉奈',
    rssUrl: 'http://ino.xrea.jp/hinatazaka46/?id=36'
  },
  // 他のメンバーも必要に応じて追加
];

// ブログを取得する関数
async function getMemberBlogs(memberId = null, limit = 5) {
  try {
    // メンバーIDが指定されていない場合はすべてのメンバーから取得
    const targetMembers = memberId && memberId !== 'all'
      ? MEMBER_BLOGS.filter(member => member.id === memberId)
      : MEMBER_BLOGS;
    
    // 各メンバーのブログを取得するPromiseの配列
    const promises = targetMembers.map(member => {
      const apiUrl = `${BLOG_API}${encodeURIComponent(member.rssUrl)}`;
      
      return fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (!data.items || data.items.length === 0) {
            return [];
          }
          
          // 各ブログ記事にメンバー情報を追加
          return data.items.map(item => {
            // サムネイル画像を取得
            let thumbnail = '';
            try {
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = item.content;
              const img = tempDiv.querySelector('img');
              if (img) {
                thumbnail = img.src;
              }
            } catch (err) {
              console.warn('Error extracting thumbnail:', err);
            }
            
            // 日付をフォーマット
            const date = new Date(item.pubDate);
            const formattedDate = date.toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            
            // テキスト抜粋を取得
            let excerpt = '';
            try {
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = item.content;
              excerpt = tempDiv.textContent.trim().substring(0, 100) + '...';
            } catch (err) {
              console.warn('Error extracting excerpt:', err);
            }
            
            return {
              title: item.title,
              link: item.link,
              pubDate: formattedDate,
              excerpt: excerpt,
              thumbnail: thumbnail,
              memberId: member.id,
              memberName: member.name,
              rawDate: date // ソート用
            };
          });
        });
    });
    
    // すべてのPromiseが解決するのを待つ
    const results = await Promise.all(promises);
    
    // 結果を1つの配列にフラット化
    let allBlogs = [];
    results.forEach(blogs => {
      allBlogs = allBlogs.concat(blogs);
    });
    
    // 日付で降順にソート
    allBlogs.sort((a, b) => b.rawDate - a.rawDate);
    
    // 指定された数だけ返す
    return allBlogs.slice(0, limit);
  } catch (error) {
    console.error('Error fetching member blogs:', error);
    throw error;
  }
}

// ブログカードのHTMLを生成する関数
function generateBlogCardHtml(blog) {
  const thumbnailHtml = blog.thumbnail 
    ? `<div class="blog-thumbnail"><img src="${blog.thumbnail}" alt="${blog.title}"></div>` 
    : '';
  
  return `
    <div class="blog-card">
      ${thumbnailHtml}
      <div class="blog-content">
        <div class="blog-member">${blog.memberName}</div>
        <a href="${blog.link}" target="_blank" rel="noopener noreferrer">
          <div class="blog-title">${blog.title}</div>
        </a>
        <div class="blog-date">${blog.pubDate}</div>
        <div class="blog-excerpt">${blog.excerpt}</div>
        <a href="${blog.link}" target="_blank" rel="noopener noreferrer" class="read-more">続きを読む</a>
      </div>
    </div>
  `;
}