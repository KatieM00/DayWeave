export const validateImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch {
    return false;
  }
};

export const getPlaceholderImage = (activityType: string, name: string) => {
  const categories = {
    food: 'restaurant',
    outdoor: 'nature',
    culture: 'museum',
    shopping: 'shopping',
    tourist: 'landmark',
    music: 'concert',
    movies: 'cinema',
    theatre: 'theatre',
    indoor: 'indoor',
    nature: 'landscape'
  };

  const category = categories[activityType as keyof typeof categories] || 'activity';
  return `https://source.unsplash.com/400x200/?${encodeURIComponent(`${category},${name}`)}`;
};