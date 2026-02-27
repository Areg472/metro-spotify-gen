import { yerevan } from "./yerevan";
import { tbilisi } from "./tbilisi";
import { minsk } from "./minsk";
import { london } from "./london";
import { istanbul } from "./istanbul";
import { lyon } from "./lyon";
import { boston } from "@/data/stations/boston";
import { amsterdam } from "./amsterdam";
import { naples } from "./naples";
import { saintPetersburg } from "@/data/stations/saintpeterburg";
import { paris } from "./paris";
import { washington } from "@/data/stations/washington";
import { tokyo } from "@/data/stations/tokyo";
import { toronto } from "@/data/stations/toronto";
import { tashkent } from "@/data/stations/tashkent";
import { moscow } from "@/data/stations/moscow";
import { nanjing } from "@/data/stations/nanjing";
import { delhi } from "@/data/stations/delhi";
import { losangeles } from "@/data/stations/losangeles";
import { processAutoStations } from "./utils";
import { berlin } from "@/data/stations/berlin";
import { tehran } from "@/data/stations/tehran";
import { chicago } from "@/data/stations/chicago";

export const stations = {
  yerevan: processAutoStations(yerevan),
  tbilisi: processAutoStations(tbilisi),
  minsk: processAutoStations(minsk),
  london: processAutoStations(london),
  boston: processAutoStations(boston),
  lyon: processAutoStations(lyon),
  nanjing: processAutoStations(nanjing),
  istanbul: processAutoStations(istanbul),
  paris: processAutoStations(paris),
  moscow: processAutoStations(moscow),
  saintPetersburg: processAutoStations(saintPetersburg),
  amsterdam: processAutoStations(amsterdam),
  naples: processAutoStations(naples),
  washington: processAutoStations(washington),
  tokyo: processAutoStations(tokyo),
  toronto: processAutoStations(toronto),
  tashkent: processAutoStations(tashkent),
  delhi: processAutoStations(delhi),
  losAngeles: processAutoStations(losangeles),
  berlin: processAutoStations(berlin),
  tehran: processAutoStations(tehran),
  chicago: processAutoStations(chicago),
}.sort((a, b) => a.name.localeCompare(b.name));

export default stations;
