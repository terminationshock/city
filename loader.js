class Loader {
    load(game) {
        this.streets = [
            'g0000',
            'r0001',
            'r0005',
            'r0009',
            'r0013',
            'r0017',
            'r0021',
            'r0045',
            'r0049',
            'r0053',
            'r0057',
            'r0061',
            'r0065',
            'r0069',
            'r0073',
            'r0077',
            'r0081',
            'r0085'
        ];

        this.houses = [
            'h0001',
            'h0005',
            'h0009',
            'h0013',
            'h0017',
            'h0021',
            'h0025',
            'h0029',
            'h0033',
            'h0037',
            'h0041',
            'h0045',
            'h0049',
            'h0053',
            'h0057',
            'h0061',
            'h0065',
            'h0069',
            'h0073',
            'h0077',
            'h0081',
            'h0085',
            'h0089',
            'h0093',
            'h0097',
            'h0101',
            'h0105',
            'h0109',
            'h0113',
            'h0117',
            'h0121',
            'h0125',
            'h0129',
            'h0133',
            'h0137',
            'h0141',
            'h0145',
            'h0149',
            'h0153',
            'h0157',
            'h0161',
            'h0165',
            'h0169',
            'h0173',
            'h0177',
            'h0181',
            'h0185',
            'h0189',
            'h0193',
            'h0197',
            'h0201',
            'h0205',
            'h0209',
            'h0213',
            'h0217',
            'h0221',
            'h0225',
            'h0229',
            'h0233',
            'h0237',
            'h0241',
            'h0245',
            'h0249',
            'h0253'
        ];

        this.trees = [
            't01',
            't02',
            't03',
            't04',
            't05',
            't06',
            't07',
            't08',
            't09',
            't10',
            't11'
        ];

        this.cars = [
            'v01',
            'v02',
            'v03',
            'v04',
            'v05',
            'v06',
            'v07',
            'v08',
            'v09',
            'v10',
            'v11',
            'v12'
        ];

        this.streets.forEach(function (street) {
            game.load.image(street, 'img/'+street+'.png');
        });

        this.houses.forEach(function (house) {
            game.load.image(house, 'img/'+house+'.png');
        });

        this.trees.forEach(function (tree) {
            game.load.image(tree, 'img/'+tree+'.png');
        });

        this.cars.forEach(function (car) {
            game.load.spritesheet(car, 'img/'+car+'.png', config.Car.imgSize, config.Car.imgSize, config.Car.headingOrder.length*config.Car.numTypes);
        });
    }
}
