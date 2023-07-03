const {ChartJSNodeCanvas} = require('chartjs-node-canvas');
const width = 500;   // define width and height of canvas
const height = 300;
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
        for (const dataSet in stats[stat]) {
            const index = parseInt(dataSet - 1);
            configuration.data.datasets[index].data.push(stats[stat][dataSet]);
        }
    }

    const dataUrl = await canvasRenderService.renderToDataURL(configuration); // converts chart to image
    return dataUrl;
};

module.exports = {
    createImage   //for exporting to another file
}