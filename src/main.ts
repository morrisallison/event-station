import {EventStation} from './models/EventStation';

/* Set properties for module loader compatibility */
(<any>EventStation).EventStation = EventStation;
(<any>EventStation).default = EventStation;

// tslint:disable-next-line:no-default-export export-name
export default EventStation;
