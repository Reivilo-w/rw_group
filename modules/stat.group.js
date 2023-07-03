const {ChartJSNodeCanvas} = require('chartjs-node-canvas');
const width = 1000;   // define width and height of canvas
const height = 600;
const chartCallback = (ChartJS) => {
    console.log('chart built')
};
const canvasRenderService = new ChartJSNodeCanvas({width, height, backgroundColour: 'white'}); //creates canvas

const createImage = async (stats) => {
    const configuration = {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: "Absence de vote",
                    data: [],
                    fill: false,
                    backgroundColor: ['rgb(90,90,90)'],
                },
                {
                    label: "Présent",
                    data: [],
                    fill: false,
                    backgroundColor: ['rgb(58, 227, 116)'],
                },
                {
                    label: "En retard",
                    data: [],
                    fill: false,
                    backgroundColor: ['rgb(255, 175, 64)'],
                },
                {
                    label: "Absent",
                    data: [],
                    fill: false,
                    backgroundColor: ['rgb(255, 56, 56)'],
                }
            ],

        },
        options: {
            responsive: true,
            interaction: {
                intersect: false,
            },
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    ticks: {
                        stepSize: 1
                    }

                }
            }
        }
    }

    for (const stat in stats) {
        configuration.data.labels.push(stat);
        for(let i = 0; i < 4; i++) {
            configuration.data.datasets[i].data.push(stats[stat][i]);
        }
    }

    const dataUrl = await canvasRenderService.renderToDataURL(configuration); // converts chart to image
    return dataUrl;
};

module.exports = {
    createImage   //for exporting to another file
}