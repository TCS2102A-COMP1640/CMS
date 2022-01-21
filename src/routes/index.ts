import { Router } from "express";
import { AppConfig } from "../types";
import Auth from "./auth";

export function AuthRoute(config: AppConfig): Router {
	return Auth(Router(), config);
}
