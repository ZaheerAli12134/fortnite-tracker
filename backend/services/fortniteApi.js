import axios from 'axios';

const API_BASE_URL = 'https://fortnite-api.com/v2';

export const getCurrentItemShop = async () => {
  try {
    if (!process.env.FN_API_KEY || process.env.FN_API_KEY === 'your_fortnite_api_key_here') {
      throw new Error('No valid Fortnite API key configured');
    }

    const response = await axios.get(`${API_BASE_URL}/shop`, {
      headers: {
        'Authorization': process.env.FN_API_KEY
      },
      params: {
        language: 'en'
      },
      timeout: 10000
    });

    if (response.data && response.data.data) {
      const shopData = response.data.data;
      
      let allItems = [];
      
      if (shopData.entries && Array.isArray(shopData.entries)) {
        shopData.entries.forEach((entry) => {
          if (entry.brItems && Array.isArray(entry.brItems)) {
            const transformedItems = entry.brItems.map(brItem => {
              return {
                ...brItem,
                shopData: {
                  regularPrice: entry.regularPrice,
                  finalPrice: entry.finalPrice,
                  offerId: entry.offerId,
                  inDate: entry.inDate,
                  outDate: entry.outDate,
                  banner: entry.banner,
                  layout: entry.layout,
                  devName: entry.devName,
                  giftable: entry.giftable,
                  refundable: entry.refundable
                }
              };
            });
            
            allItems = allItems.concat(transformedItems);
          }
        });
        
        if (allItems.length === 0) {
          throw new Error('No brItems found in shop entries');
        }
        
        const allowedTypes = ['outfit', 'emote', 'pickaxe', 'backpack'];
        const filteredItems = allItems.filter(item => 
          item.type && allowedTypes.includes(item.type.value)
        );
        
        const transformedItems = filteredItems.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          type: {
            id: item.type.value,
            name: item.type.displayValue
          },
          rarity: {
            id: item.rarity.value,
            name: item.rarity.displayValue
          },
          images: item.images,
          price: item.shopData?.finalPrice || 0,
          introduction: item.introduction,
          shopData: item.shopData
        }));
        
        const result = {
          items: transformedItems,
          totalItems: transformedItems.length
        };
        
        return result;
        
      } else {
        throw new Error('No entries array found in shop data');
      }
      
    } else {
      throw new Error('No shop data found in response');
    }

  } catch (error) {
    throw new Error(`Failed to fetch item shop: ${error.response?.data?.error || error.message}`);
  }
};

export const searchCosmetics = async (searchTerm, type = 'all') => {
  try {
    if (!process.env.FN_API_KEY || process.env.FN_API_KEY === 'your_fortnite_api_key_here') {
      throw new Error('No valid Fortnite API key configured');
    }

    const response = await axios.get(`${API_BASE_URL}/cosmetics/br`, {
      headers: { 
        'Authorization': process.env.FN_API_KEY
      },
      params: {
        language: 'en'
      },
      timeout: 10000
    });

    if (!response.data || !response.data.data) {
      throw new Error('No cosmetics data in API response');
    }

    const allowedTypes = ['outfit', 'emote', 'pickaxe', 'backpack'];
    
    const filteredItems = response.data.data.filter(item => {
      const isAllowedType = allowedTypes.includes(item.type.value);
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesType = true;
      if (type !== 'all') {
        const typeMap = {
          'skin': 'outfit',
          'emote': 'emote',
          'pickaxe': 'pickaxe',
          'backbling': 'backpack'
        };
        matchesType = item.type.value === typeMap[type];
      }
      
      return isAllowedType && matchesSearch && matchesType;
    });

    return filteredItems.slice(0, 20);

  } catch (error) {
    throw new Error(`Search failed: ${error.response?.data?.error || error.message}`);
  }
};