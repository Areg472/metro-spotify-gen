import { yerevan } from "./yerevan";
import { cairo } from "./cairo";
import { capeTown } from "./capetown";
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
import { newyorkcity } from "@/data/stations/newyorkcity";
import { beijing } from "@/data/stations/beijing";
import { budapest } from "@/data/stations/budapest";
import { helsinki } from "@/data/stations/helsinki";
import { sydney } from "@/data/stations/sydney";
import { athens } from "@/data/stations/athens";
import { minecraft } from "./minecraft";

const rawStations = {
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
  newyorkcity: processAutoStations(newyorkcity),
  beijing: processAutoStations(beijing),
  cairo: processAutoStations(cairo),
  capeTown: processAutoStations(capeTown),
  budapest: processAutoStations(budapest),
  helsinki: processAutoStations(helsinki),
  sydney: processAutoStations(sydney),
  athens: processAutoStations(athens),
  minecraft: processAutoStations(minecraft),
};

export const stations = Object.fromEntries(
  Object.entries(rawStations).sort(([a], [b]) => a.localeCompare(b)),
);

export default stations;
