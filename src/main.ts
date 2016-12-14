import {EventStation} from './models/EventStation';

(<any>EventStation).EventStation = EventStation;
(<any>EventStation).default = EventStation;

Object.defineProperty(EventStation, '__esModule', { value: true });

export default EventStation;
