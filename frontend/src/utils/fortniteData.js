const API_BASE_URL = 'https://fortnite-api.com/v2';
const API_KEY = process.env.FN_API_KEY || 'your-api-key-here';

const rarityMap = {
  'common': 'common',
  'uncommon': 'uncommon', 
  'rare': 'rare',
  'epic': 'epic',
  'legendary': 'legendary',
  'mythic': 'legendary',
  'transcendent': 'legendary'
};

const ALLOWED_TYPES = {
  'outfit': 'skin',
  'emote': 'emote', 
  'pickaxe': 'pickaxe',
  'backpack': 'backbling'
};

export const searchCosmetics = async (searchTerm, type = 'all') => {
  try {
    if (API_KEY === 'your-api-key-here') {
      throw new Error('No API key configured');
    }

    const response = await fetch(`${API_BASE_URL}/cosmetics/br?language=en`, {
      headers: {
        'Authorization': API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 401) {
        throw new Error(`API Error 401: Unauthorized - Invalid API key. Check your key at fortnite-api.com`);
      } else if (response.status === 403) {
        throw new Error(`API Error 403: Forbidden - API key may be invalid or expired`);
      } else if (response.status === 429) {
        throw new Error(`API Error 429: Rate limited - Too many requests`);
      } else {
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}. Response: ${errorText}`);
      }
    }

    const data = await response.json();
    
    if (!data.data) {
      throw new Error('No cosmetics found in API response');
    }

    const filteredItems = data.data.filter(item => {
      const isAllowedType = ALLOWED_TYPES.hasOwnProperty(item.type.value);
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesType = true;
      if (type !== 'all') {
        if (type === 'skin') {
          matchesType = item.type.value === 'outfit';
        } else if (type === 'emote') {
          matchesType = item.type.value === 'emote';
        } else if (type === 'pickaxe') {
          matchesType = item.type.value === 'pickaxe';
        } else if (type === 'backbling') {
          matchesType = item.type.value === 'backpack';
        }
      }
      
      return isAllowedType && matchesSearch && matchesType;
    });

    const transformedItems = filteredItems.slice(0, 20).map(item => ({
      id: item.id,
      name: item.name,
      type: mapItemType(item.type.value),
      rarity: rarityMap[item.rarity.value] || 'common',
      imageUrl: item.images.icon,
      lastSeen: calculateDaysSinceLastSeen(item),
      price: item.price ? item.price : 800,
      description: item.description,
      introduction: item.introduction?.text || 'Unknown season',
      rarityName: item.rarity?.displayValue || 'Common'
    }));

    return transformedItems;

  } catch (error) {
    throw new Error(`Failed to search cosmetics: ${error.message}`);
  }
};

export const getCosmeticById = async (id) => {
  try {
    if (API_KEY === 'your-api-key-here') {
      throw new Error('No API key configured');
    }

    const response = await fetch(`${API_BASE_URL}/cosmetics/br/${id}`, {
      headers: {
        'Authorization': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!ALLOWED_TYPES[data.data.type.value]) {
      throw new Error('Item type not allowed');
    }
    
    return {
      id: data.data.id,
      name: data.data.name,
      type: mapItemType(data.data.type.value),
      rarity: rarityMap[data.data.rarity.value] || 'common',
      imageUrl: data.data.images.icon,
      lastSeen: calculateDaysSinceLastSeen(data.data),
      price: data.data.price || 800,
      description: data.data.description,
      introduction: data.data.introduction?.text || 'Unknown season',
      rarityName: data.data.rarity?.displayValue || 'Common'
    };

  } catch (error) {
    throw new Error(`Failed to fetch cosmetic: ${error.message}`);
  }
};

const mapItemType = (apiType) => {
  return ALLOWED_TYPES[apiType] || 'other';
};

const calculateDaysSinceLastSeen = (item) => {
  if (!item.added) return 30;
  
  const addedDate = new Date(item.added);
  const today = new Date();
  const diffTime = Math.abs(today - addedDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.min(diffDays, 365);
};