import { UserPlus, Search, Calendar, Package } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Create Account',
    description: 'Sign up with your university email and verify your student ID',
    color: 'blue',
  },
  {
    icon: Search,
    title: 'Browse Equipment',
    description: 'Search our catalog and find the tools or devices you need',
    color: 'green',
  },
  {
    icon: Calendar,
    title: 'Reserve Online',
    description: 'Select your pickup date and time slot that works for you',
    color: 'purple',
  },
  {
    icon: Package,
    title: 'Pick Up & Return',
    description: 'Collect your equipment and return it by the due date',
    color: 'orange',
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How It{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Borrowing equipment is easy. Just follow these simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600',
              green: 'bg-green-100 text-green-600',
              purple: 'bg-purple-100 text-purple-600',
              orange: 'bg-orange-100 text-orange-600',
            };

            return (
              <div
                key={index}
                className="flex gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Step Number & Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${colorClasses[step.color]}`}>
                    <Icon size={28} />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-6 bg-gray-200 mx-auto mt-2"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-500">STEP {index + 1}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
