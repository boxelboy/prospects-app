// setting up local tables
import { Mongo } from 'meteor/mongo';
 
export const Prospects = new Ground.Collection('prospects');

export const Settings = new Ground.Collection('settings');