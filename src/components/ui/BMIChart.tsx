import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const BMIChart = () => {

    const data = JSON.parse(localStorage.getItem("bmiHistory")) || [];

    return (
        <div className="w-full h-64 mt-6">
            <ResponsiveContainer>
                <LineChart data={data}>
                    <XAxis dataKey="date" />
                    <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="bmi"
                        stroke="#22c55e"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BMIChart;