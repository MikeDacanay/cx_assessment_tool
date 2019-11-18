export default class Likert {
    constructor(attr) {
    	this.val = 0;
    	this.textArr = attr.textArr;
    	this.group = attr.group;
    	this.count = attr.count;
    }

    assignValue(qLen,v){
    	this.val = Math.round(100*(1/qLen)*(v/100));
    }    
}
