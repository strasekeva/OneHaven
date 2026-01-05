import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
} from "chart.js";
import styled from "styled-components";
import tw from "twin.macro";
import { SectionHeading } from "components/misc/Headings.js";

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const Container = tw.div`relative bg-gray-100 py-20`;
const ChartContainer = styled.div`
  ${tw`max-w-screen-xl mx-auto`}
`;
const Heading = tw(SectionHeading)`w-full`;

const EnergyChart = () => {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        // Fetch JSON file with energy data
        fetch("/output_pyaxis.json")
            .then((response) => response.json())
            .then((data) => {
                if (data && data.data && data.metadata && data.metadata["VALUES(ENERGETSKI VIR)"]) {
                    // Extract unique years
                    const years = Array.from(new Set(data.data.map((item) => item.LETO))).sort();

                    // Extract energy sources
                    const energySources = data.metadata["VALUES(ENERGETSKI VIR)"];

                    // Prepare datasets for each energy source
                    const datasets = energySources.map((source) => {
                        const sourceData = years.map((year) => {
                            const entry = data.data.find(
                                (item) =>
                                    item["ENERGETSKI VIR"] === source &&
                                    item.LETO === year &&
                                    item.DATA !== null // Exclude null values
                            );
                            return entry ? parseFloat(entry.DATA) || 0 : 0; // Default to 0 if no data
                        });

                        return {
                            label: source, // Label for the energy source
                            data: sourceData, // Data values for each year
                            borderColor: getRandomColor(), // Assign a random color
                            backgroundColor: "rgba(0, 0, 0, 0)", // No fill color
                            borderWidth: 2,
                        };
                    });

                    // Set chart data
                    setChartData({
                        labels: years, // Years for the X-axis
                        datasets: datasets, // Datasets for each energy source
                    });
                } else {
                    console.error("Invalid JSON structure.");
                }
            })
            .catch((error) => console.error("Error loading data:", error));
    }, []);

    // Function to generate random colors
    const getRandomColor = () => {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return `rgba(${r}, ${g}, ${b}, 1)`;
    };

    if (!chartData) {
        return <div>Loading data...</div>;
    }

    return (
        <Container>
            <ChartContainer>
                <Heading>Poraba obnovljivih virov energije</Heading>
                <Line
                    data={chartData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: { position: "right" }, // Legend moved to the right
                            title: {
                                display: true,
                                text: "Poraba obnovljivih virov energije po energetskih virih",
                            },
                        },
                        scales: {
                            x: { title: { display: true, text: "Leto" } },
                            y: { title: { display: true, text: "Poraba (TJ)" } },
                        },
                    }}
                />
            </ChartContainer>
        </Container>
    );
};

export default EnergyChart;