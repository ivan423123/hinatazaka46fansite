// YouTubeサービス - 日向坂46関連のYouTube動画を取得する機能

// YouTube チャンネル情報
const YOUTUBE_CHANNELS = [
    {
      id: 'UCR0V48DJyWbwEAdxLL5FjxA',
      name: '日向坂46official',
      description: '日向坂46の公式チャンネル'
    },
    {
      id: 'UCOB24f8lQBCnVqPZXOkVpOg',
      name: '日向坂ちゃんねる',
      description: '日向坂46のバラエティコンテンツ'
    }
  ];
  
  // RSS to JSON APIのエンドポイント
  const RSS_TO_JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';
  
  // YouTubeのフィードURLのベース
  const YOUTUBE_FEED_BASE = 'https://www.youtube.com/feeds/videos.xml?channel_id=';
  
  // 特定のチャンネルから動画を取得する関数
  async function getYoutubeVideos(channelId = null, limit = 5) {
    try {
      // チャンネルIDが指定されていない場合はすべてのチャンネルから取得
      const channelIds = channelId && channelId !== 'all' 
        ? [channelId]
        : YOUTUBE_CHANNELS.map(channel => channel.id);
      
      // 各チャンネルの動画を取得するPromiseの配列
      const promises = channelIds.map(id => {
        const feedUrl = `${YOUTUBE_FEED_BASE}${id}`;
        const apiUrl = `${RSS_TO_JSON_API}${encodeURIComponent(feedUrl)}`;
        
        return fetch(apiUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            // チャンネル名を取得
            const channelInfo = YOUTUBE_CHANNELS.find(c => c.id === id);
            const channelName = channelInfo ? channelInfo.name : data.feed.title;
            
            // 各動画にチャンネル情報を追加
            return data.items.map(item => {
              // YouTube動画IDを抽出
              const videoId = item.link.split('v=')[1];
              
              // 日付をフォーマット
              const date = new Date(item.pubDate);
              const formattedDate = date.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
              
              return {
                title: item.title,
                link: item.link,
                videoId: videoId,
                thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                channelId: id,
                channelName: channelName,
                pubDate: formattedDate,
                rawDate: date // ソート用
              };
            });
          });
      });
      
      // すべてのPromiseが解決するのを待つ
      const results = await Promise.all(promises);
      
      // 結果を1つの配列にフラット化
      let allVideos = [];
      results.forEach(videos => {
        allVideos = allVideos.concat(videos);
      });
      
      // 日付で降順にソート
      allVideos.sort((a, b) => b.rawDate - a.rawDate);
      
      // 指定された数だけ返す
      return allVideos.slice(0, limit);
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      throw error;
    }
  }
  
  // 動画カードのHTMLを生成する関数
  function generateVideoCardHtml(video) {
    return `
      <div class="video-card">
        <a href="${video.link}" target="_blank" rel="noopener noreferrer">
          <div class="video-thumbnail">
            <img src="${video.thumbnail}" alt="${video.title}">
          </div>
        </a>
        <div class="video-info">
          <a href="${video.link}" target="_blank" rel="noopener noreferrer">
            <div class="video-title">${video.title}</div>
          </a>
          <div class="video-channel">${video.channelName}</div>
          <div class="video-date">${video.pubDate}</div>
        </div>
      </div>
    `;
  }