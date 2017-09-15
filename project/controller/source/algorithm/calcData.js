// JavaScript source code
var CalData = function (param)
{
    var self = this;

    
    self.standardValue = 0;
    self.valueCount = 0;
    self.averageCount = param.averageCount;
    self.averageMaxCount = param.averageMaxCount;
    self.averageValue = [];
    self.allowError = param.allowError ;

    self.getData = function () {
        return self.standardValue;
    }

    self.addData = function (data) {
        var intData = Number(data);
        self.valueCount++;

        if (self.valueCount == 1){
            self.standardValue = intData;
        }
        else {
            self.averageValue.push(intData);
            //BU.log(data);
            if (self.averageCount <= self.averageValue.length) {
                //BU.log("Average Total Count : " + self.averageValue.length);
                var totalValue = 0;
                for (var i = 0; i < self.averageValue.length; i++) {
                    totalValue += self.averageValue[i];
                }

                var ErrorValue = self.standardValue - totalValue / self.averageValue.length;
                var absErrorValue = Math.abs(ErrorValue);

                if (absErrorValue >= self.allowError || self.valueCount > self.averageMaxCount) {
                    //BU.log("Result Overflow : " + absErrorValue);
                    self.standardValue = totalValue / self.averageValue.length;
                    self.averageValue = [];
                    self.valueCount = 1;
                }
                else {
                    //BU.log("Result Normal : " + absErrorValue);
                }
            }
        }

    }

    self.resetData = function (){
        self.standardValue = -1;
        self.valueCount = 0;
        self.averageValue = [];
    }


}

exports.CalData = CalData;