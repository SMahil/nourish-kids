import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-cooking.png";

interface Props {
  onStart: () => void;
}

const OnboardingWelcome = ({ onStart }: Props) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md text-center"
      >
        <motion.img
          src={heroImg}
          alt="Family cooking together"
          className="mx-auto mb-8 w-64 h-64 object-contain animate-float"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-foreground">
          NourishKids
        </h1>
        <p className="mb-2 text-lg font-semibold text-primary">
          Know before you cook — will your child actually eat it?
        </p>
        <p className="mb-8 text-muted-foreground leading-relaxed">
          Tell us what your child loves and hates. We'll score every recipe for your specific kid — before you spend 30 minutes cooking it.
        </p>
        <Button
          onClick={onStart}
          size="lg"
          className="gradient-warm border-0 px-10 py-6 text-lg font-bold text-primary-foreground shadow-warm rounded-full hover:opacity-90 transition-opacity"
        >
          Let's Get Started 🍳
        </Button>
      </motion.div>
    </div>
  );
};

export default OnboardingWelcome;
