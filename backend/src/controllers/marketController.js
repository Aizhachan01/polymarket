import { getMarkets, getMarketById } from "../services/marketService.js";
import { getMarketBets, getMarketPools } from "../services/betService.js";

export async function getAllMarkets(req, res, next) {
  try {
    const markets = await getMarkets(req.query);

    res.json({
      success: true,
      data: markets,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMarket(req, res, next) {
  try {
    const marketId = req.params.id;
    const market = await getMarketById(marketId);

    // Get market pools
    const pools = await getMarketPools(marketId);

    res.json({
      success: true,
      data: {
        ...market,
        pools,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMarketBetsHandler(req, res, next) {
  try {
    const marketId = req.params.id;
    const bets = await getMarketBets(marketId);

    res.json({
      success: true,
      data: bets,
    });
  } catch (error) {
    next(error);
  }
}
