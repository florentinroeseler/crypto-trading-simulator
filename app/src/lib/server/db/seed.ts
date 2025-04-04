import { db } from './index';
import { assets } from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Starte das Seeding der Datenbank...');

    // Überprüfen, ob bereits Daten vorhanden sind
    const existingAssets = await db.select().from(assets);
    
    if (existingAssets.length > 0) {
      console.log('Die Datenbank enthält bereits Assets. Seeding wird übersprungen.');
      return;
    }

    // Krypto-Assets einfügen
    const cryptoAssets = [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        type: 'crypto',
        currentPrice: 65423.42,
        imageUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        type: 'crypto',
        currentPrice: 3567.89,
        imageUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
      },
      {
        symbol: 'BNB',
        name: 'Binance Coin',
        type: 'crypto',
        currentPrice: 584.32,
        imageUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.png'
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        type: 'crypto',
        currentPrice: 142.75,
        imageUrl: 'https://cryptologos.cc/logos/solana-sol-logo.png'
      },
      {
        symbol: 'ADA',
        name: 'Cardano',
        type: 'crypto',
        currentPrice: 0.54,
        imageUrl: 'https://cryptologos.cc/logos/cardano-ada-logo.png'
      },
      {
        symbol: 'XRP',
        name: 'Ripple',
        type: 'crypto',
        currentPrice: 0.61,
        imageUrl: 'https://cryptologos.cc/logos/xrp-xrp-logo.png'
      },
      {
        symbol: 'DOGE',
        name: 'Dogecoin',
        type: 'crypto',
        currentPrice: 0.15,
        imageUrl: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png'
      },
      {
        symbol: 'DOT',
        name: 'Polkadot',
        type: 'crypto',
        currentPrice: 7.23,
        imageUrl: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png'
      },
      {
        symbol: 'AVAX',
        name: 'Avalanche',
        type: 'crypto',
        currentPrice: 35.86,
        imageUrl: 'https://cryptologos.cc/logos/avalanche-avax-logo.png'
      },
      {
        symbol: 'SHIB',
        name: 'Shiba Inu',
        type: 'crypto',
        currentPrice: 0.000023,
        imageUrl: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png'
      }
    ];

    // Assets in die Datenbank einfügen
    await db.insert(assets).values(cryptoAssets);

    console.log('Seeding abgeschlossen. 10 Krypto-Assets wurden hinzugefügt.');
  } catch (error) {
    console.error('Fehler beim Seeding der Datenbank:', error);
    process.exit(1);
  }
};

// Führe das Seeding aus
seedDatabase();