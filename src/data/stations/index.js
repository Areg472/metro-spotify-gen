import { yerevan } from "./yerevan";
import { tbilisi } from "./tbilisi";
import { minsk } from "./minsk";
import { london } from "./london";
import { istanbul } from "./istanbul";
import { lyon } from "./lyon";
import { amsterdam } from "./amsterdam";
import { naples } from "./naples";
import { paris } from "./paris";
import { washington } from "@/data/stations/washington";
import { tokyo } from "@/data/stations/tokyo";
import { toronto } from "@/data/stations/toronto";
import { tashkent } from "@/data/stations/tashkent";
import { moscow } from "@/data/stations/moscow";
import { delhi } from "@/data/stations/delhi";
import { losAngeles } from "@/data/stations/losAngeles";
import { processAutoStations } from "./utils";

export const stations = {
  yerevan: processAutoStations(yerevan),
  tbilisi: processAutoStations(tbilisi),
  minsk: processAutoStations(minsk),
  london: processAutoStations(london),
  lyon: processAutoStations(lyon),
  istanbul: processAutoStations(istanbul),
  paris: processAutoStations(paris),
  moscow: processAutoStations(moscow),
  amsterdam: processAutoStations(amsterdam),
  naples: processAutoStations(naples),
  washington: processAutoStations(washington),
  tokyo: processAutoStations(tokyo),
  toronto: processAutoStations(toronto),
  tashkent: processAutoStations(tashkent),
  delhi: processAutoStations(delhi),
  losAngeles: processAutoStations(losAngeles),
};

export default stations;
