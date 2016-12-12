import {EventStation} from './EventStation';

(<any>EventStation).EventStation = EventStation;
(<any>EventStation).default = EventStation;

Object.defineProperty(EventStation, '__esModule', { value: true });

export default EventStation;
