import { Config } from "@remotion/cli/config";
import os from "os";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(os.cpus().length);
Config.setJpegQuality(80);
Config.setPixelFormat("yuv420p");
Config.setCodec("h264");
