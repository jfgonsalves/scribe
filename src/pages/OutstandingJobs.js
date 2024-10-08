import {
  Box,
  Flex,
  Text,
  VStack,
  Button,
  HStack,
  Icon,
  Checkbox,
  Tooltip,
  useBreakpointValue,
  useColorMode,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaUser, FaCalendarAlt, FaIdBadge } from "react-icons/fa";
import { toggleJobsItem } from "../utils/patientUtils";

const OutstandingJobs = ({ handleSelectPatient, refreshSidebar }) => {
  const [patients, setPatients] = useState([]);

  const fetchPatientsWithJobs = async () => {
    try {
      const response = await fetch(`/api/patients-with-jobs`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setPatients(
        data.map((patient) => ({
          ...patient,
          jobs_list: JSON.parse(patient.jobs_list || "[]"),
        })),
      );
    } catch (error) {
      console.error("Error fetching patients with jobs:", error);
    }
  };

  useEffect(() => {
    fetchPatientsWithJobs();
  }, []);

  const { colorMode } = useColorMode();

  const URNumber = ({ number }) => (
    <Box
      width="90px"
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
      position="relative"
      _after={{
        content: '""',
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: "30px",
        background:
          "linear-gradient(to right, transparent, var(--panels-bg-color) 90%)",
      }}
    >
      <Text>{number}</Text>
    </Box>
  );

  const PatientName = ({ name }) => (
    <Box
      width="90px"
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
      position="relative"
      _after={{
        content: '""',
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: "30px",
        background:
          "linear-gradient(to right, transparent, var(--panels-bg-color) 90%)",
      }}
    >
      <Text fontWeight="bold">{name}</Text>
    </Box>
  );

  const formatName = (name) => {
    const nameParts = name.split(", ");
    const firstNameInitial = nameParts[1] ? nameParts[1][0] : "";
    const lastName = nameParts[0];
    return `${firstNameInitial}. ${lastName}`;
  };

  const columns = useBreakpointValue({ base: 1, sm: 2, md: 4, lg: 6 });

  const patientGroups = [];
  for (let i = 0; i < columns; i++) {
    patientGroups.push([]);
  }

  patients.forEach((patient, index) => {
    patientGroups[index % columns].push(patient);
  });

  const handleToggleJobs = async (patientId, index) => {
    await toggleJobsItem(
      patientId,
      index,
      patients,
      setPatients,
      refreshSidebar,
    );
  };

  return (
    <Box p="5" borderRadius="md" w="100%">
      <Text fontSize="2xl" mb="4" className="headings">
        Outstanding Jobs
      </Text>
      <Flex wrap="wrap" gap={6} alignItems="flex-start">
        {patientGroups.map((group, groupIndex) => (
          <VStack
            key={groupIndex}
            spacing={6}
            minWidth="390px"
            maxWidth="400px"
            flex="1"
          >
            {group.map((patient) => (
              <Box
                key={patient.id}
                border="1px solid"
                borderColor="gray.300"
                p="4"
                borderRadius="md"
                width="100%"
                className="summary-panels"
                sx={{
                  "--panels-bg-color":
                    colorMode === "light" ? "#fffaf3" : "#1f1d2e",
                }}
              >
                <VStack spacing="3" align="stretch">
                  <Flex align="center" gap={2}>
                    <Tooltip label={patient.name} aria-label="Full name">
                      <HStack spacing="2">
                        <Icon as={FaUser} />
                        <PatientName name={formatName(patient.name)} />
                      </HStack>
                    </Tooltip>
                    <HStack spacing="2">
                      <Icon as={FaCalendarAlt} />
                      <Text>{patient.dob}</Text>
                    </HStack>
                    <Tooltip label={patient.ur_number} aria-label="UR Number">
                      <HStack spacing="2">
                        <Icon as={FaIdBadge} />
                        <URNumber number={patient.ur_number} />
                      </HStack>
                    </Tooltip>
                  </Flex>
                  <Text fontStyle="italic">{patient.encounter_summary}</Text>
                  <Text fontWeight="bold">Plan:</Text>
                  <VStack align="start">
                    {patient.jobs_list &&
                      patient.jobs_list.map((item, index) => (
                        <Checkbox
                          key={index}
                          className="checkbox task-checkbox"
                          isChecked={item.completed}
                          onChange={() =>
                            handleToggleJobs(
                              patient.id,
                              index,
                              patients,
                              setPatients,
                            )
                          }
                        >
                          {item.job}
                        </Checkbox>
                      ))}
                  </VStack>
                  <Button
                    className="green-button"
                    onClick={() => handleSelectPatient(patient)}
                  >
                    Go to Encounter
                  </Button>
                </VStack>
              </Box>
            ))}
          </VStack>
        ))}
      </Flex>
    </Box>
  );
};

export default OutstandingJobs;
