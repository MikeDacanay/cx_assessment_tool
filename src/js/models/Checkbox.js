export default class Checkbox {
    constructor(attr) {       
    	this.val = 25;
        this.group = attr.group;
        this.count = attr.count;
        this.question = attr.question;
    	this.textArr = attr.textArr;
        this.id = null;
    	this.choseAns = [];
        this.pointVal = this.retrievePointVal()*75;        
    }

    addAns(answers){
        this.clearAnswers();
        for(let answer of answers){
    	   this.choseAns.push(answer);
        }        
    }    

    clearAnswers(){
    	this.choseAns = [];	
    }

    retrievePointVal(){
        const checkbox = this.textArr;
        const checkboxLen = checkbox.length;
        const value = 1/checkboxLen;
        return value;        
    }

    assignValue(){
        const len = Number(this.textArr.length);
        const ansLen = Number(this.choseAns.length);

        this.val = (ansLen/len)*100;
    }
}
