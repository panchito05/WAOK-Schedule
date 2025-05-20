import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { EmployeeListsProvider } from "./context/EmployeeListsContext";
import { PersonnelDataProvider } from "./context/PersonnelDataContext";
import { RulesProvider } from "./context/RulesContext";
import { ShiftProvider } from "./context/ShiftContext";
import { ShiftPrioritiesProvider } from "./context/ShiftPrioritiesContext";

function Router() {
  return (
    <Switch>
      {/* Add pages below */}
      {/* <Route path="/" component={Home}/> */}
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <EmployeeListsProvider>
          <PersonnelDataProvider>
            <RulesProvider>
              <ShiftProvider>
                <ShiftPrioritiesProvider>
                  <Toaster />
                  <Router />
                </ShiftPrioritiesProvider>
              </ShiftProvider>
            </RulesProvider>
          </PersonnelDataProvider>
        </EmployeeListsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
