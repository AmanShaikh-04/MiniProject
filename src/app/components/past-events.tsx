import React from "react";

const PastEvents = () => {
  const events = [
    {
      id: 1,
      title: "Event 1",
      description: "Lorem ipsum dolor sit amet",
      date: "2024-02-15",
    },
    {
      id: 2,
      title: "Event 2",
      description: "Consectetur adipiscing elit",
      date: "2024-02-10",
    },
    {
      id: 3,
      title: "Event 3",
      description: "Sed do eiusmod tempor",
      date: "2024-02-05",
    },
    {
      id: 4,
      title: "Event 4",
      description: "Ut labore et dolore magna",
      date: "2024-02-01",
    },
  ];

  return (
    <div className="w-full p-6 px-25 bg-background">
      <h2 className="text-3xl font-bold text-left text-gray-800 mb-8">
        Past Events
      </h2>
      <div className="grid grid-cols-4 gap-12">
        {events.map((event) => (
          <div key={event.id} className="flex flex-col items-center">
            {/* Image Circle Stacked Over the Card */}
            <div className="w-40 h-40 rounded-full overflow-hidden -mb-12 z-10 bg-[#948fff] flex items-center justify-center">
              <img
                src="/assets/aiktclogo.jpg"
                alt="Event Logo"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Card with Circle Overlap */}
            <div
              className="w-full text-center p-6 rounded-lg min-h-[250px] flex flex-col justify-center relative"
              style={{ backgroundColor: "#BFDBFE" }}
            >
              <h3 className="font-medium text-[#030307] mb-2">{event.title}</h3>
              <p className="text-sm text-[#030307] mb-3">{event.description}</p>
              <p className="text-xs text-[#030307]">{event.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PastEvents;
