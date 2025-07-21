// Font category mapping - reference list for determining categories
const FONT_CATEGORIES: Record<string, Font['category']> = {
    Mulish: 'sans-serif',
    Cairo: 'sans-serif',
    Damion: 'cursive',
    Mukta: 'sans-serif',
    Montserrat: 'sans-serif',
    Tangerine: 'cursive',
    'Noto Serif SC': 'serif',
    'Noto Sans': 'sans-serif',
    Barlow: 'sans-serif',
    'Roboto Slab': 'serif',
    Tajawal: 'sans-serif',
    Prompt: 'sans-serif',
    Hind: 'sans-serif',
    Rubik: 'sans-serif',
    Rajdhani: 'sans-serif',
    Sono: 'monospace',
    'Bungee Inline': 'special',
    'Rubik Marker Hatch': 'special',
    'Are You Serious': 'special',
    Kings: 'special',
    'Noto Serif HK': 'serif',
    Raleway: 'sans-serif',
    'Rubik Burned': 'special',
    'Bungee Shade': 'special',
    'Fuzzy Bubbles': 'handwriting',
    'Noto Serif JP': 'serif',
    'IBM Plex Sans JP': 'sans-serif',
    Parisienne: 'cursive',
    'Rubik Maze': 'special',
    'Open Sans': 'sans-serif',
    Eater: 'special',
    Barrio: 'special',
    'Finger Paint': 'handwriting',
    'Sedgwick Ave Display': 'special',
    'Work Sans': 'sans-serif',
    'Caesar Dressing': 'special',
    Arimo: 'sans-serif',
    'Hind Siliguri': 'sans-serif',
    'Rubik Iso': 'special',
    Kanit: 'sans-serif',
    Lobster: 'cursive',
    'Playfair Display': 'serif',
    'PT Serif': 'serif',
    Italianno: 'cursive',
    Silkscreen: 'special',
    'Shadows Into Light': 'handwriting',
    'Noto Serif TC': 'serif',
    Yellowtail: 'cursive',
    Pacifico: 'cursive',
    Blaka: 'special',
    Nosifer: 'special',
    Codystar: 'special',
    Caveat: 'handwriting',
    'La Belle Aurore': 'cursive',
    Marhey: 'special',
    'Sono Monospace': 'monospace',
    'M PLUS Rounded 1c': 'sans-serif',
    'Great Vibes': 'cursive',
    Frijole: 'special',
    'Builder Extended': 'sans-serif',
    'Nunito Sans': 'sans-serif',
    Lato: 'sans-serif',
    Monoton: 'special',
    'Builder Mono': 'monospace',
    Teko: 'sans-serif',
    Rye: 'special',
    Audiowide: 'special',
    'Dancing Script': 'cursive',
    'Irish Grover': 'special',
    'Nothing You Could Do': 'handwriting',
    Akronim: 'special',
    'Fira Sans': 'sans-serif',
    'Faster One': 'special',
    Poppins: 'sans-serif',
    'Libre Baskerville': 'serif',
    Lora: 'serif',
    'Nanum Gothic': 'sans-serif',
    'Rubik Wet Paint': 'special',
    Quicksand: 'sans-serif',
    'Noto Sans HK': 'sans-serif',
    'PT Sans': 'sans-serif',
    'Builder Sans': 'sans-serif',
    Inter: 'sans-serif',
    'Unica One': 'special',
    Monofett: 'special'
};

export default defineEventHandler(async event => {
    try {
        // Step 1: Get font IDs from Roblox toolbox service
        console.log('Step 1: Fetching font IDs...');
        const toolboxResponse = await fetch(
            'https://apis.roblox.com/toolbox-service/v1/marketplace/73?limit=100'
        );

        if (!toolboxResponse.ok) {
            throw new Error(`Failed to fetch font IDs: ${toolboxResponse.status}`);
        }

        const toolboxData = await toolboxResponse.json();
        const fontIds: number[] = toolboxData.data.map((item: { id: number }) => item.id);

        if (fontIds.length === 0) {
            return { data: [] };
        }

        console.log(`Found ${fontIds.length} font IDs`);

        // Step 2: Get previews in batches of 50
        console.log('Step 2: Fetching previews...');
        const previews: Record<number, string> = {};

        for (let i = 0; i < fontIds.length; i += 50) {
            const batch = fontIds.slice(i, i + 50);
            const assetIds = batch.join(',');

            const thumbnailResponse = await fetch(
                `https://thumbnails.roblox.com/v1/assets?assetIds=${assetIds}&size=728x90&format=png`
            );

            if (!thumbnailResponse.ok) {
                console.warn(
                    `Failed to fetch thumbnails for batch ${i / 50 + 1}: ${
                        thumbnailResponse.status
                    }`
                );
                continue;
            }

            const thumbnailData = await thumbnailResponse.json();

            for (const item of thumbnailData.data) {
                if (item.imageUrl) {
                    previews[item.targetId] = item.imageUrl;
                }
            }
        }

        // Step 3: Get font names
        console.log('Step 3: Fetching font names...');
        const names: Record<number, string> = {};
        const assetIds = fontIds.join(',');

        const detailsResponse = await fetch(
            `https://apis.roblox.com/toolbox-service/v1/items/details?assetIds=${assetIds}`
        );

        if (!detailsResponse.ok) {
            throw new Error(`Failed to fetch font details: ${detailsResponse.status}`);
        }

        const detailsData = await detailsResponse.json();

        for (const item of detailsData.data) {
            if (item.asset && item.asset.name) {
                names[item.asset.id] = item.asset.name;
            }
        }

        // Step 4: Combine data and determine categories
        console.log('Step 4: Combining data and determining categories...');
        const fonts: Font[] = fontIds
            .map(id => ({
                id,
                name: names[id] || `Font ${id}`,
                preview: previews[id] || '',
                category: FONT_CATEGORIES[names[id] || `Font ${id}`] || 'unknown'
            }))
            .filter(font => font.name && font.preview); // Only include fonts with both name and preview

        console.log(`Successfully processed ${fonts.length} fonts`);

        return { data: fonts };
    } catch (error) {
        console.error('Error fetching fonts:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch fonts'
        });
    }
});
